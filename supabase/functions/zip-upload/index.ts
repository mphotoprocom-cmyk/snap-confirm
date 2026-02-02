import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { default as JSZip } from "https://esm.sh/jszip@3.10.1";

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

// ---- R2 (S3-compatible) upload via fetch + AWS SigV4
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
}): Promise<Response> {
  const { host, bucketName, key, accessKeyId, secretAccessKey, body, contentType } = args;

  const region = "auto";
  const service = "s3";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = await sha256Hex(body);

  const encodedKey = awsEncodePath(key);
  const canonicalUri = `/${bucketName}/${encodedKey}`;

  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    "content-type": contentType,
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
  return await fetch(url, {
    method: "PUT",
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
      "Content-Type": contentType,
    },
    body: body as unknown as BodyInit,
  });
}

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];

function isImageFile(filename: string): boolean {
  const lowerName = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lowerName.endsWith(ext));
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
  };
  return types[ext || ''] || 'application/octet-stream';
}

// Get just the filename without path
function getBasename(filepath: string): string {
  const parts = filepath.split('/');
  return parts[parts.length - 1];
}

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  key: string;
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

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const zipFile = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) || "delivery";
    const galleryId = formData.get("galleryId") as string | null;

    if (!zipFile) {
      return new Response(JSON.stringify({ error: "No ZIP file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if it's a ZIP file
    const isZip = zipFile.name.toLowerCase().endsWith('.zip') || 
                  zipFile.type === 'application/zip' || 
                  zipFile.type === 'application/x-zip-compressed';

    if (!isZip) {
      return new Response(JSON.stringify({ error: "File must be a ZIP archive" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ZIP file: ${zipFile.name}, size: ${zipFile.size} bytes`);

    // Read and extract ZIP
    const zipBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    const uploadedFiles: UploadedFile[] = [];
    const errors: string[] = [];
    let processedCount = 0;

    // Get all files from ZIP
    const files = Object.entries(zip.files).filter(([name, file]) => 
      !file.dir && isImageFile(name) && !name.startsWith('__MACOSX') && !name.startsWith('.')
    );

    console.log(`Found ${files.length} image files in ZIP`);

    // Process files in batches to avoid overwhelming the system
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async ([filename, file]) => {
        try {
          const content = await file.async('uint8array');
          const originalFilename = getBasename(filename);
          const fileExt = originalFilename.includes('.') ? originalFilename.split('.').pop() : 'jpg';
          
          const timestamp = Date.now();
          const randomId = crypto.randomUUID().slice(0, 8);
          const folderPath = galleryId ? `${folder}/${galleryId}` : folder;
          const key = `${userId}/${folderPath}/${timestamp}-${randomId}.${fileExt}`;
          
          const contentType = getContentType(originalFilename);
          
          const putRes = await uploadToR2({
            host,
            bucketName,
            key,
            accessKeyId,
            secretAccessKey,
            body: content,
            contentType,
          });

          if (!putRes.ok) {
            const errText = await putRes.text();
            console.error(`Failed to upload ${originalFilename}:`, putRes.status, errText);
            throw new Error(`Upload failed: ${putRes.status}`);
          } else {
            await putRes.text(); // Consume body
          }

          const fileUrl = `${publicUrl}/${key}`;
          
          return {
            success: true,
            file: {
              filename: originalFilename,
              url: fileUrl,
              size: content.length,
              key,
            }
          };
        } catch (error) {
          console.error(`Error processing ${filename}:`, error);
          return {
            success: false,
            filename: getBasename(filename),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const results = await Promise.all(batchPromises);
      
      for (const result of results) {
        processedCount++;
        if (result.success && result.file) {
          uploadedFiles.push(result.file);
        } else {
          errors.push(`${result.filename}: ${result.error}`);
        }
      }

      console.log(`Processed ${processedCount}/${files.length} files`);
    }

    console.log(`ZIP extraction complete. Success: ${uploadedFiles.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        uploaded: uploadedFiles,
        totalFiles: files.length,
        successCount: uploadedFiles.length,
        errorCount: errors.length,
        errors: errors.slice(0, 10), // Only return first 10 errors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("ZIP upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
