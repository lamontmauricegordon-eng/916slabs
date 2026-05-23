export interface Env {
  BUCKET: R2Bucket;
  AI: Ai;
  KV: KVNamespace;
  Hung_slabs: any;
  Acct_API_slabs: any;
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Test Endpoint
    if (request.method === "GET" && url.pathname === "/api/endpoint") {
      return Response.json({
        success: true,
        message: "Hello from 916slabs!",
        timestamp: new Date().toISOString(),
      }, { headers: corsHeaders });
    }

    // File Management Routes
    if (url.pathname.startsWith("/api/files")) {
      // List files
      if (request.method === "GET" && url.pathname === "/api/files") {
        const listed = await env.BUCKET.list();
        return Response.json({
          success: true,
          count: listed.objects.length,
          files: listed.objects.map(obj => ({
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded,
          }))
        }, { headers: corsHeaders });
      }

      // Upload file
      if (request.method === "POST" && url.pathname === "/api/files/upload") {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) {
          return Response.json({ success: false, error: "No file uploaded" }, { status: 400, headers: corsHeaders });
        }

        const key = `BinderExports/${crypto.randomUUID()}-${file.name}`;
        await env.BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type || "application/octet-stream" }
        });

        return Response.json({ success: true, key }, { status: 201, headers: corsHeaders });
      }

      // Download & Delete routes can stay as they were...
    }

    return Response.json({ success: false, error: "Route not found" }, { status: 404, headers: corsHeaders });

  } catch (err: any) {
    return Response.json({ success: false, error: err?.message }, { status: 500, headers: corsHeaders });
  }
};
