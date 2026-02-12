import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v.trim();
}

const textEncoder = new TextEncoder();

function awsEncodePath(path: string): string {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`))
    .join("/");
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(data));
}

async function getSigningKey(secretAccessKey: string, dateStamp: string, region: string, service: string) {
  const kSecret = textEncoder.encode("AWS4" + secretAccessKey).buffer;
  const kDate = await hmacSha256(kSecret, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return await hmacSha256(kService, "aws4_request");
}

async function putToR2(key: string, body: Uint8Array, contentType: string): Promise<string> {
  const bucketName = requireEnv("R2_BUCKET_NAME");
  const publicUrl = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const host = `${accountId}.r2.cloudflarestorage.com`;

  const region = "auto";
  const service = "s3";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = await sha256Hex(body);
  const encodedKey = awsEncodePath(key);
  const canonicalUri = `/${bucketName}/${encodedKey}`;

  const headers: Record<string, string> = {
    host,
    "content-type": contentType,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers).sort().map((k) => `${k}:${headers[k].trim()}\n`).join("");
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(textEncoder.encode(canonicalRequest))].join("\n");
  const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}/${bucketName}/${encodedKey}`, {
    method: "PUT",
    headers: { "Content-Type": contentType, "x-amz-date": amzDate, "x-amz-content-sha256": payloadHash, Authorization: authorization },
    body: body as unknown as BodyInit,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`R2 upload failed: ${res.status} - ${errText}`);
  }
  await res.text();
  return `${publicUrl}/${key}`;
}

/**
 * Simple image resize using canvas-like approach.
 * Decodes JPEG/PNG, downscales, re-encodes as JPEG.
 * Uses imagescript for Deno-compatible image processing.
 */
async function resizeImage(imageBytes: Uint8Array, maxWidth: number): Promise<Uint8Array> {
  const { Image } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");
  
  const img = await Image.decode(imageBytes);
  
  // Only resize if wider than maxWidth
  if (img.width > maxWidth) {
    const ratio = maxWidth / img.width;
    const newHeight = Math.round(img.height * ratio);
    img.resize(maxWidth, newHeight);
  }
  
  // Encode as PNG (imagescript's native format, reliable)
  const encoded = await img.encode(1); // quality 1 = PNG
  return new Uint8Array(encoded);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));

    const { image_url, image_id } = await req.json();

    if (!image_url || !image_id) {
      return new Response(JSON.stringify({ error: "Missing image_url or image_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating thumbnail for image: ${image_id}`);

    // Fetch original image
    const imgRes = await fetch(image_url, { headers: { "User-Agent": "SnapConfirm-Thumbnail/1.0" } });
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch image: ${imgRes.status}`);
    }

    const originalBytes = new Uint8Array(await imgRes.arrayBuffer());
    console.log(`Original image size: ${originalBytes.length} bytes`);

    // Resize to thumbnail (max 400px wide)
    const thumbnailBytes = await resizeImage(originalBytes, 400);
    console.log(`Thumbnail size: ${thumbnailBytes.length} bytes`);

    // Extract the R2 key path from original URL to create thumbnail path
    const publicUrl = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
    let thumbnailKey: string;

    if (image_url.startsWith(publicUrl)) {
      // Same R2 bucket - create thumbnail alongside original
      const originalKey = image_url.replace(publicUrl + "/", "");
      const parts = originalKey.split("/");
      const filename = parts.pop()!;
      const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
      thumbnailKey = [...parts, `thumb_${nameWithoutExt}.png`].join("/");
    } else {
      // External URL - create a new path
      thumbnailKey = `thumbnails/${image_id}.png`;
    }

    // Upload thumbnail to R2
    const thumbnailUrl = await putToR2(thumbnailKey, thumbnailBytes, "image/png");
    console.log(`Thumbnail uploaded: ${thumbnailUrl}`);

    // Update database record
    const { error: updateError } = await supabase
      .from("delivery_images")
      .update({ thumbnail_url: thumbnailUrl })
      .eq("id", image_id);

    if (updateError) {
      console.error("DB update failed:", updateError);
      throw new Error(`DB update failed: ${updateError.message}`);
    }

    console.log(`Thumbnail generated successfully for ${image_id}`);

    return new Response(
      JSON.stringify({ success: true, thumbnail_url: thumbnailUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Thumbnail generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
