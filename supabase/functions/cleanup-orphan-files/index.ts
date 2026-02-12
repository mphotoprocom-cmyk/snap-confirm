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
    .map((seg) =>
      encodeURIComponent(seg).replace(
        /[!'()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
      )
    )
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

interface R2Config {
  host: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

function getR2Config(): R2Config {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  return {
    host: `${accountId}.r2.cloudflarestorage.com`,
    bucketName: requireEnv("R2_BUCKET_NAME"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    publicUrl: requireEnv("R2_PUBLIC_URL").replace(/\/$/, ""),
  };
}

async function signedRequest(
  method: string,
  config: R2Config,
  path: string,
  queryString: string = "",
): Promise<Response> {
  const region = "auto";
  const service = "s3";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = await sha256Hex(new Uint8Array(0));
  const canonicalUri = `/${config.bucketName}/${awsEncodePath(path)}`;

  const headers: Record<string, string> = {
    host: config.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((k) => `${k}:${headers[k].trim()}\n`)
    .join("");

  const canonicalRequest = [
    method,
    canonicalUri,
    queryString,
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

  const signingKey = await getSigningKey(config.secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${config.host}/${config.bucketName}/${awsEncodePath(path)}${queryString ? "?" + queryString : ""}`;
  return await fetch(url, {
    method,
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
  });
}

async function deleteR2Object(config: R2Config, key: string): Promise<boolean> {
  const region = "auto";
  const service = "s3";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = await sha256Hex(new Uint8Array(0));
  const encodedKey = awsEncodePath(key);
  const canonicalUri = `/${config.bucketName}/${encodedKey}`;

  const headers: Record<string, string> = {
    host: config.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((k) => `${k}:${headers[k].trim()}\n`)
    .join("");

  const canonicalRequest = ["DELETE", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(textEncoder.encode(canonicalRequest))].join("\n");
  const signingKey = await getSigningKey(config.secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${config.host}/${config.bucketName}/${encodedKey}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
  });

  await res.text(); // consume body
  return res.ok || res.status === 204;
}

/** List objects in R2 bucket under a given prefix using S3 ListObjectsV2 */
async function listR2Objects(config: R2Config, prefix: string, continuationToken?: string): Promise<{ keys: string[]; nextToken?: string }> {
  const region = "auto";
  const service = "s3";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = await sha256Hex(new Uint8Array(0));
  const canonicalUri = `/${config.bucketName}/`;

  // Build query params (must be sorted alphabetically for SigV4)
  const params = new Map<string, string>();
  if (continuationToken) params.set("continuation-token", continuationToken);
  params.set("list-type", "2");
  params.set("max-keys", "1000");
  params.set("prefix", prefix);

  const sortedKeys = [...params.keys()].sort();
  const queryString = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params.get(k)!)}`)
    .join("&");

  const headers: Record<string, string> = {
    host: config.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((k) => `${k}:${headers[k].trim()}\n`)
    .join("");

  const canonicalRequest = ["GET", canonicalUri, queryString, canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(textEncoder.encode(canonicalRequest))].join("\n");
  const signingKey = await getSigningKey(config.secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${config.host}/${config.bucketName}/?${queryString}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ListObjectsV2 failed: ${res.status} - ${errText}`);
  }

  const xml = await res.text();

  // Parse keys from XML response
  const keys: string[] = [];
  const keyRegex = /<Key>([^<]+)<\/Key>/g;
  let match;
  while ((match = keyRegex.exec(xml)) !== null) {
    keys.push(match[1]);
  }

  // Check for continuation token
  const truncatedMatch = xml.match(/<IsTruncated>true<\/IsTruncated>/);
  let nextToken: string | undefined;
  if (truncatedMatch) {
    const tokenMatch = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
    if (tokenMatch) nextToken = tokenMatch[1];
  }

  return { keys, nextToken };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = requireEnv("SUPABASE_URL");
    const supabaseAnonKey = requireEnv("SUPABASE_ANON_KEY");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const config = getR2Config();

    const { dry_run = true } = await req.json().catch(() => ({ dry_run: true }));

    console.log(`Starting orphan cleanup for user: ${userId}, dry_run: ${dry_run}`);

    // 1. List all R2 objects under this user's delivery/ prefix
    const prefix = `${userId}/delivery/`;
    let allR2Keys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const result = await listR2Objects(config, prefix, continuationToken);
      allR2Keys = allR2Keys.concat(result.keys);
      continuationToken = result.nextToken;
    } while (continuationToken);

    console.log(`Found ${allR2Keys.length} objects in R2 under ${prefix}`);

    // 2. Get all known URLs from DB (image_url + thumbnail_url)
    const serviceSupabase = createClient(supabaseUrl, requireEnv("SUPABASE_SERVICE_ROLE_KEY"));

    // Get all delivery_images for this user
    const { data: dbImages, error: dbError } = await serviceSupabase
      .from("delivery_images")
      .select("image_url, thumbnail_url")
      .eq("user_id", userId);

    if (dbError) throw new Error(`DB query failed: ${dbError.message}`);

    // Build set of known R2 keys from DB URLs
    const knownKeys = new Set<string>();
    for (const img of dbImages || []) {
      if (img.image_url) {
        try {
          const url = new URL(img.image_url);
          knownKeys.add(url.pathname.replace(/^\//, ""));
        } catch { /* skip invalid URLs */ }
      }
      if (img.thumbnail_url) {
        try {
          const url = new URL(img.thumbnail_url);
          knownKeys.add(url.pathname.replace(/^\//, ""));
        } catch { /* skip */ }
      }
    }

    console.log(`Found ${knownKeys.size} known keys in DB`);

    // 3. Find orphans (in R2 but not in DB)
    const orphanKeys = allR2Keys.filter((key) => !knownKeys.has(key));
    console.log(`Found ${orphanKeys.length} orphaned files`);

    // 4. Delete orphans (if not dry run)
    let deletedCount = 0;
    let failedCount = 0;

    if (!dry_run && orphanKeys.length > 0) {
      for (const key of orphanKeys) {
        try {
          const success = await deleteR2Object(config, key);
          if (success) {
            deletedCount++;
            console.log(`Deleted orphan: ${key}`);
          } else {
            failedCount++;
            console.warn(`Failed to delete: ${key}`);
          }
        } catch (err) {
          failedCount++;
          console.error(`Error deleting ${key}:`, err);
        }
      }
    }

    const result = {
      success: true,
      dry_run,
      total_r2_objects: allR2Keys.length,
      total_db_records: knownKeys.size,
      orphan_count: orphanKeys.length,
      deleted_count: deletedCount,
      failed_count: failedCount,
      orphan_keys: dry_run ? orphanKeys.slice(0, 50) : [], // Show first 50 in dry run
      message: dry_run
        ? `Dry run: found ${orphanKeys.length} orphaned files. Set dry_run=false to delete them.`
        : `Deleted ${deletedCount} orphaned files (${failedCount} failed).`,
    };

    console.log("Cleanup result:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Cleanup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
