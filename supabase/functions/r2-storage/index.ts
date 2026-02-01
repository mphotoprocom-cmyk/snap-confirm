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


// ---- R2 (S3-compatible) upload/delete via fetch + AWS SigV4 (no AWS SDK; avoids fs.readFile in edge runtime)
const textEncoder = new TextEncoder();

function awsEncodePath(path: string): string {
  // Encode each segment to RFC3986, keep slashes
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

async function signAndFetchR2(args: {
  method: "PUT" | "DELETE";
  host: string;
  bucketName: string;
  key: string;
  accessKeyId: string;
  secretAccessKey: string;
  body?: Uint8Array;
  contentType?: string;
}): Promise<Response> {
  const { method, host, bucketName, key, accessKeyId, secretAccessKey, body, contentType } = args;

  const region = "auto";
  const service = "s3";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.substring(0, 8);

  const payload = body ?? new Uint8Array(0);
  const payloadHash = await sha256Hex(payload);

  const encodedKey = awsEncodePath(key);
  const canonicalUri = `/${bucketName}/${encodedKey}`;

  // Canonical headers must be lowercase sorted by header name.
  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (method === "PUT") {
    headers["content-type"] = contentType || "application/octet-stream";
  }

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((k) => `${k}:${headers[k].trim()}\n`)
    .join("");

  const canonicalRequest = [
    method,
    canonicalUri,
    "", // query string
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

  const requestHeaders: HeadersInit = {
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHash,
    Authorization: authorization,
  };
  if (method === "PUT") {
    requestHeaders["Content-Type"] = contentType || "application/octet-stream";
  }

  const url = `https://${host}/${bucketName}/${encodedKey}`;
  return await fetch(url, {
    method,
    headers: requestHeaders,
    body: method === "PUT" ? (payload as unknown as BodyInit) : undefined,
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const bucketName = requireEnv("R2_BUCKET_NAME");
    const publicUrl = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
    const accountId = requireEnv("R2_ACCOUNT_ID");
    const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
    const host = `${accountId}.r2.cloudflarestorage.com`;

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST" && action === "upload") {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string | null) || "general";

      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const timestamp = Date.now();
      const randomId = crypto.randomUUID().slice(0, 8);
      const key = `${userId}/${folder}/${timestamp}-${randomId}.${fileExt}`;

      const fileBuffer = await file.arrayBuffer();

      const putRes = await signAndFetchR2({
        method: "PUT",
        host,
        bucketName,
        key,
        accessKeyId,
        secretAccessKey,
        body: new Uint8Array(fileBuffer),
        contentType: file.type || "application/octet-stream",
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        console.error("R2 PUT failed:", putRes.status, errText);
        throw new Error(`R2 upload failed: ${putRes.status} - ${errText}`);
      } else {
        // Consume body to avoid resource leaks
        await putRes.text();
      }

      const fileUrl = `${publicUrl}/${key}`;
      console.log(`File uploaded successfully: ${key}`);

      return new Response(
        JSON.stringify({
          success: true,
          url: fileUrl,
          filename: file.name,
          size: file.size,
          key,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE" && action === "delete") {
      const { key } = await req.json();

      if (!key) {
        return new Response(JSON.stringify({ error: "No file key provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (typeof key !== "string" || !key.startsWith(`${userId}/`)) {
        return new Response(JSON.stringify({ error: "Unauthorized to delete this file" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const delRes = await signAndFetchR2({
        method: "DELETE",
        host,
        bucketName,
        key,
        accessKeyId,
        secretAccessKey,
      });

      // R2 usually returns 204
      if (!delRes.ok && delRes.status !== 204) {
        const errText = await delRes.text();
        console.error("R2 DELETE failed:", delRes.status, errText);
        throw new Error(`R2 delete failed: ${delRes.status} - ${errText}`);
      } else {
        await delRes.text();
      }

      console.log(`File deleted successfully: ${key}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("R2 Storage error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
