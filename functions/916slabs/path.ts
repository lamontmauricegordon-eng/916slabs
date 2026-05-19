export interface Env {
  BUCKET: R2Bucket;
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
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // =========================
    // TEST ENDPOINT
    // =========================
    if (request.method === "GET" && url.pathname === "/api/endpoint") {
      return Response.json(
        {
          success: true,
          message: "Hello from 916slabs!",
          timestamp: new Date().toISOString(),
        },
        { headers: corsHeaders }
      );
    }

    // =========================
    // POST TEST
    // =========================
    if (request.method === "POST" && url.pathname === "/api/endpoint") {
      let body: unknown = null;

      try {
        body = await request.json();
      } catch {
        body = null;
      }

      return Response.json(
        {
          success: true,
          message: "POST received!",
          body,
        },
        { headers: corsHeaders }
      );
    }

    // =========================
    // LIST FILES
    // =========================
    if (request.method === "GET" && url.pathname === "/api/files") {
      const listed = await env.BUCKET.list();

      return Response.json(
        {
          success: true,
          count: listed.objects.length,
          files: listed.objects.map((obj) => ({
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded,
            etag: obj.etag,
            contentType: obj.httpMetadata?.contentType ?? "unknown",
          })),
        },
        { headers: corsHeaders }
      );
    }

    // =========================
    // DOWNLOAD FILE
    // =========================
    if (request.method === "GET" && url.pathname === "/api/files/download") {
      const name = url.searchParams.get("name");

      if (!name) {
        return Response.json(
          { success: false, error: "Missing ?name=" },
          { status: 400, headers: corsHeaders }
        );
      }

      const object = await env.BUCKET.get(name);

      if (!object) {
        return Response.json(
          { success: false, error: "File not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      const filename = name.split("/").pop() ?? "download";

      return new Response(object.body, {
        headers: {
          ...corsHeaders,
          "Content-Type":
            object.httpMetadata?.contentType ?? "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // =========================
    // UPLOAD FILE
    // =========================
    if (request.method === "POST" && url.pathname === "/api/files/upload") {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return Response.json(
          { success: false, error: "No file uploaded" },
          { status: 400, headers: corsHeaders }
        );
      }

      const key = `BinderExports/${crypto.randomUUID()}-${file.name}`;

      await env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: {
          contentType: file.type || "application/octet-stream",
        },
      });

      return Response.json(
        {
          success: true,
          message: "File uploaded successfully",
          key,
        },
        { status: 201, headers: corsHeaders }
      );
    }

    // =========================
    // DELETE FILE
    // =========================
    if (request.method === "DELETE" && url.pathname === "/api/files") {
      const name = url.searchParams.get("name");

      if (!name) {
        return Response.json(
          { success: false, error: "Missing ?name=" },
          { status: 400, headers: corsHeaders }
        );
      }

      await env.BUCKET.delete(name);

      return Response.json(
        {
          success: true,
          message: "File deleted successfully",
          key: name,
        },
        { headers: corsHeaders }
      );
    }

    // =========================
    // FALLBACK
    // =========================
    return Response.json(
      { success: false, error: "Route not found" },
      { status: 404, headers: corsHeaders }
    );
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err?.message ?? "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
};
