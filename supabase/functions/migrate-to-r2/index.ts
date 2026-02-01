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

// ---- R2 Upload via fetch + AWS SigV4
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
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(data));
}

async function getSigningKey(secretAccessKey: string, dateStamp: string, region: string, service: string) {
  const kSecret = textEncoder.encode("AWS4" + secretAccessKey).buffer;
  const kDate = await hmacSha256(kSecret, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

async function uploadToR2(args: {
  host: string;
  bucketName: string;
  key: string;
  accessKeyId: string;
  secretAccessKey: string;
  body: Uint8Array;
  contentType: string;
}): Promise<string> {
  const { host, bucketName, key, accessKeyId, secretAccessKey, body, contentType } = args;

  const region = "auto";
  const service = "s3";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = await sha256Hex(body);
  const encodedKey = awsEncodePath(key);
  const canonicalUri = `/${bucketName}/${encodedKey}`;

  const headers: Record<string, string> = {
    "content-type": contentType,
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((k) => `${k}:${headers[k].trim()}\n`)
    .join("");

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(textEncoder.encode(canonicalRequest)),
  ].join("\n");

  const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${host}/${bucketName}/${encodedKey}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
    body: body as unknown as BodyInit,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`R2 upload failed: ${response.status} - ${errText}`);
  }
  await response.text();
  return key;
}

// Check if URL is from Supabase Storage
function isSupabaseStorageUrl(url: string | null, supabaseUrl: string): boolean {
  if (!url) return false;
  return url.includes(supabaseUrl) && url.includes("/storage/v1/object/public/");
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

    const supabaseUrl = requireEnv("SUPABASE_URL");
    const supabaseServiceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    // Use service role for migration (need to update other users' data)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const supabaseAuth = createClient(supabaseUrl, requireEnv("SUPABASE_ANON_KEY"), {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountId = requireEnv("R2_ACCOUNT_ID");
    const bucketName = requireEnv("R2_BUCKET_NAME");
    const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
    const publicUrl = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
    const host = `${accountId}.r2.cloudflarestorage.com`;

    const results = {
      portfolio_images: { migrated: 0, failed: 0, errors: [] as string[] },
      delivery_images: { migrated: 0, failed: 0, errors: [] as string[] },
      profiles_logo: { migrated: 0, failed: 0, errors: [] as string[] },
      profiles_signature: { migrated: 0, failed: 0, errors: [] as string[] },
      invitation_images: { migrated: 0, failed: 0, errors: [] as string[] },
      delivery_covers: { migrated: 0, failed: 0, errors: [] as string[] },
      invitation_covers: { migrated: 0, failed: 0, errors: [] as string[] },
    };

    // Helper function to migrate a single file
    async function migrateFile(
      oldUrl: string,
      folder: string,
      fileUserId: string
    ): Promise<string | null> {
      try {
        // Download from Supabase
        const response = await fetch(oldUrl);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const buffer = await response.arrayBuffer();
        
        // Extract filename from URL
        const urlParts = oldUrl.split("/");
        const originalFilename = urlParts[urlParts.length - 1];
        const ext = originalFilename.includes(".") ? originalFilename.split(".").pop() : "bin";
        
        // Create new key
        const timestamp = Date.now();
        const randomId = crypto.randomUUID().slice(0, 8);
        const key = `${fileUserId}/${folder}/${timestamp}-${randomId}.${ext}`;
        
        // Upload to R2
        await uploadToR2({
          host,
          bucketName,
          key,
          accessKeyId,
          secretAccessKey,
          body: new Uint8Array(buffer),
          contentType,
        });
        
        return `${publicUrl}/${key}`;
      } catch (error) {
        console.error(`Failed to migrate ${oldUrl}:`, error);
        return null;
      }
    }

    // 1. Migrate portfolio_images
    const { data: portfolioImages } = await supabase
      .from("portfolio_images")
      .select("id, image_url, user_id");
    
    if (portfolioImages) {
      for (const img of portfolioImages) {
        if (isSupabaseStorageUrl(img.image_url, supabaseUrl)) {
          const newUrl = await migrateFile(img.image_url, "portfolio", img.user_id);
          if (newUrl) {
            await supabase
              .from("portfolio_images")
              .update({ image_url: newUrl })
              .eq("id", img.id);
            results.portfolio_images.migrated++;
          } else {
            results.portfolio_images.failed++;
            results.portfolio_images.errors.push(img.id);
          }
        }
      }
    }

    // 2. Migrate delivery_images
    const { data: deliveryImages } = await supabase
      .from("delivery_images")
      .select("id, image_url, user_id");
    
    if (deliveryImages) {
      for (const img of deliveryImages) {
        if (isSupabaseStorageUrl(img.image_url, supabaseUrl)) {
          const newUrl = await migrateFile(img.image_url, "delivery", img.user_id);
          if (newUrl) {
            await supabase
              .from("delivery_images")
              .update({ image_url: newUrl })
              .eq("id", img.id);
            results.delivery_images.migrated++;
          } else {
            results.delivery_images.failed++;
            results.delivery_images.errors.push(img.id);
          }
        }
      }
    }

    // 3. Migrate profiles (logo_url and signature_url)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, logo_url, signature_url");
    
    if (profiles) {
      for (const profile of profiles) {
        // Logo
        if (isSupabaseStorageUrl(profile.logo_url, supabaseUrl)) {
          const newUrl = await migrateFile(profile.logo_url, "profile", profile.user_id);
          if (newUrl) {
            await supabase
              .from("profiles")
              .update({ logo_url: newUrl })
              .eq("id", profile.id);
            results.profiles_logo.migrated++;
          } else {
            results.profiles_logo.failed++;
            results.profiles_logo.errors.push(profile.id);
          }
        }
        
        // Signature
        if (isSupabaseStorageUrl(profile.signature_url, supabaseUrl)) {
          const newUrl = await migrateFile(profile.signature_url, "profile", profile.user_id);
          if (newUrl) {
            await supabase
              .from("profiles")
              .update({ signature_url: newUrl })
              .eq("id", profile.id);
            results.profiles_signature.migrated++;
          } else {
            results.profiles_signature.failed++;
            results.profiles_signature.errors.push(profile.id);
          }
        }
      }
    }

    // 4. Migrate invitation_images
    const { data: invitationImages } = await supabase
      .from("invitation_images")
      .select("id, image_url, user_id");
    
    if (invitationImages) {
      for (const img of invitationImages) {
        if (isSupabaseStorageUrl(img.image_url, supabaseUrl)) {
          const newUrl = await migrateFile(img.image_url, "invitation", img.user_id);
          if (newUrl) {
            await supabase
              .from("invitation_images")
              .update({ image_url: newUrl })
              .eq("id", img.id);
            results.invitation_images.migrated++;
          } else {
            results.invitation_images.failed++;
            results.invitation_images.errors.push(img.id);
          }
        }
      }
    }

    // 5. Migrate delivery_galleries cover images
    const { data: deliveryGalleries } = await supabase
      .from("delivery_galleries")
      .select("id, cover_image_url, user_id");
    
    if (deliveryGalleries) {
      for (const gallery of deliveryGalleries) {
        if (isSupabaseStorageUrl(gallery.cover_image_url, supabaseUrl)) {
          const newUrl = await migrateFile(gallery.cover_image_url, "delivery", gallery.user_id);
          if (newUrl) {
            await supabase
              .from("delivery_galleries")
              .update({ cover_image_url: newUrl })
              .eq("id", gallery.id);
            results.delivery_covers.migrated++;
          } else {
            results.delivery_covers.failed++;
            results.delivery_covers.errors.push(gallery.id);
          }
        }
      }
    }

    // 6. Migrate wedding_invitations cover images
    const { data: invitations } = await supabase
      .from("wedding_invitations")
      .select("id, cover_image_url, user_id");
    
    if (invitations) {
      for (const inv of invitations) {
        if (isSupabaseStorageUrl(inv.cover_image_url, supabaseUrl)) {
          const newUrl = await migrateFile(inv.cover_image_url, "invitation", inv.user_id);
          if (newUrl) {
            await supabase
              .from("wedding_invitations")
              .update({ cover_image_url: newUrl })
              .eq("id", inv.id);
            results.invitation_covers.migrated++;
          } else {
            results.invitation_covers.failed++;
            results.invitation_covers.errors.push(inv.id);
          }
        }
      }
    }

    console.log("Migration completed:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Migration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
