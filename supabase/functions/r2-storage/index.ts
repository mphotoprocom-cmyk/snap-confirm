import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Upload file to R2 using native fetch (no AWS SDK to avoid fs.readFile issues in Deno)
async function uploadToR2(
  accountId: string,
  bucketName: string,
  accessKeyId: string,
  secretAccessKey: string,
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<void> {
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
  const date = new Date().toUTCString();
  const method = "PUT";
  
  // Simple signing for R2 (using basic auth header approach)
  // R2 supports AWS Signature Version 4
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const region = "auto";
  const service = "s3";
  
  // Create canonical request
  const canonicalUri = `/${bucketName}/${key}`;
  const canonicalQueryString = "";
  const payloadHash = await sha256Hex(body);
  
  const canonicalHeaders = 
    `content-type:${contentType}\n` +
    `host:${accountId}.r2.cloudflarestorage.com\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  
  const canonicalRequest = 
    `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  
  // Create string to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = 
    `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256Hex(new TextEncoder().encode(canonicalRequest))}`;
  
  // Calculate signature
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = await hmacSha256Hex(signingKey, stringToSign);
  
  // Create authorization header
  const authorizationHeader = 
    `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": contentType,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      "Authorization": authorizationHeader,
    },
    body: body.buffer as ArrayBuffer,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("R2 upload error response:", errorText);
    throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
  }
}

// Delete file from R2 using native fetch
async function deleteFromR2(
  accountId: string,
  bucketName: string,
  accessKeyId: string,
  secretAccessKey: string,
  key: string
): Promise<void> {
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
  const method = "DELETE";
  
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const region = "auto";
  const service = "s3";
  
  const canonicalUri = `/${bucketName}/${key}`;
  const canonicalQueryString = "";
  const payloadHash = await sha256Hex(new Uint8Array(0));
  
  const canonicalHeaders = 
    `host:${accountId}.r2.cloudflarestorage.com\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  
  const canonicalRequest = 
    `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = 
    `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256Hex(new TextEncoder().encode(canonicalRequest))}`;
  
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = await hmacSha256Hex(signingKey, stringToSign);
  
  const authorizationHeader = 
    `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  const response = await fetch(endpoint, {
    method,
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      "Authorization": authorizationHeader,
    },
  });
  
  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    console.error("R2 delete error response:", errorText);
    throw new Error(`R2 delete failed: ${response.status} - ${errorText}`);
  }
}

// Helper functions for AWS Signature V4
async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const keyBuffer = key instanceof Uint8Array ? key.buffer as ArrayBuffer : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function hmacSha256Hex(key: ArrayBuffer, data: string): Promise<string> {
  const result = await hmacSha256(key, data);
  return Array.from(new Uint8Array(result))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode("AWS4" + secretKey).buffer as ArrayBuffer, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const accountId = Deno.env.get("R2_ACCOUNT_ID")!;
    const bucketName = Deno.env.get("R2_BUCKET_NAME")!;
    const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID")!;
    const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
    const publicUrl = Deno.env.get("R2_PUBLIC_URL")!;

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST" && action === "upload") {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const folder = formData.get("folder") as string || "general";

      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const randomId = crypto.randomUUID().slice(0, 8);
      const fileName = `${userId}/${folder}/${timestamp}-${randomId}.${fileExt}`;

      // Upload to R2
      const fileBuffer = await file.arrayBuffer();
      
      await uploadToR2(
        accountId,
        bucketName,
        accessKeyId,
        secretAccessKey,
        fileName,
        new Uint8Array(fileBuffer),
        file.type
      );

      // Construct public URL
      const fileUrl = `${publicUrl}/${fileName}`;

      console.log(`File uploaded successfully: ${fileName}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          url: fileUrl,
          filename: file.name,
          size: file.size,
          key: fileName
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (req.method === "DELETE" && action === "delete") {
      // Handle file deletion
      const { key } = await req.json();

      if (!key) {
        return new Response(
          JSON.stringify({ error: "No file key provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the user owns this file (key starts with their userId)
      if (!key.startsWith(`${userId}/`)) {
        return new Response(
          JSON.stringify({ error: "Unauthorized to delete this file" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await deleteFromR2(
        accountId,
        bucketName,
        accessKeyId,
        secretAccessKey,
        key
      );

      console.log(`File deleted successfully: ${key}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("R2 Storage error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
