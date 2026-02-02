import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching image from:", url);

    // Fetch the image from R2
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: `Failed to fetch image: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the image as array buffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Use Deno's base64 encode function which handles large files properly
    const base64 = base64Encode(arrayBuffer);
    
    // Get content type
    const contentType = response.headers.get("content-type") || "image/jpeg";

    console.log("Successfully encoded image, size:", arrayBuffer.byteLength, "bytes");

    return new Response(
      JSON.stringify({ 
        data: base64,
        contentType,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error: unknown) {
    console.error("Download error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
