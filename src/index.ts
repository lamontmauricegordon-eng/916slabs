export interface Env {
  BUCKET: R2Bucket;
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      /**
       * =========================================================
       * TEST ENDPOINT
       * GET /api/endpoint
       * =========================================================
       */
      if (
        request.method === "GET" &&
        url.pathname === "/api/endpoint"
      ) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Hello from 916slabs!",
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }

      /**
       * =========================================================
       * TEST POST
       * POST /api/endpoint
       * =========================================================
       */
      if (
        request.method === "POST" &&
        url.pathname === "/api/endpoint"
      ) {
        const body = await request.json();

        return new Response(
          JSON.stringify({
            success: true,
            message: "POST received!",
            body,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }

      /**
       * =========================================================
       * LIST FILES
       * GET /api/files
       * =========================================================
       */
      if (
        request.method === "GET" &&
        url.pathname === "/api/files"
      ) {
        const listed = await env.BUCKET.list();

        const files = listed.objects.map((obj) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          etag: obj.etag,
          contentType:
            obj.httpMetadata?.contentType || "unknown",
        }));

        return new Response(
          JSON.stringify({
            success: true,
            count: files.length,
            files,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }

      /**
       * =========================================================
       * DOWNLOAD FILE
       * GET /api/files/download?name=filename.ext
       * =========================================================
       */
      if (
        request.method === "GET" &&
        url.pathname === "/api/files/download"
      ) {
        const name = url.searchParams.get("name");

        if (!name) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing ?name= parameter",
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        const object = await env.BUCKET.get(name);

        if (!object) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "File not found",
            }),
            {
              status: 404,
              headers: corsHeaders,
            }
          );
        }

        const filename =
          name.split("/").pop() || "download";

        return new Response(object.body, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              object.httpMetadata?.contentType ||
              "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      /**
       * =========================================================
       * UPLOAD FILE
       * POST /api/files/upload
       * FormData: file
       * =========================================================
       */
      if (
        request.method === "POST" &&
        url.pathname === "/api/files/upload"
      ) {
        const formData = await request.formData();

        const file = formData.get("file");

        if (!(file instanceof File)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "No file uploaded",
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        const key = `BinderExports/${Date.now()}-${file.name}`;

        await env.BUCKET.put(
          key,
          await file.arrayBuffer(),
          {
            httpMetadata: {
              contentType:
                file.type || "application/octet-stream",
            },
          }
        );

        return new Response(
          JSON.stringify({
            success: true,
            message: "File uploaded successfully",
            key,
            filename: file.name,
            size: file.size,
            type: file.type,
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      }

      /**
       * =========================================================
       * DELETE FILE
       * DELETE /api/files?name=filename.ext
       * =========================================================
       */
      if (
        request.method === "DELETE" &&
        url.pathname === "/api/files"
      ) {
        const name = url.searchParams.get("name");

        if (!name) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing ?name= parameter",
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        await env.BUCKET.delete(name);

        return new Response(
          JSON.stringify({
            success: true,
            message: "File deleted successfully",
            key: name,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }

      /**
       * =========================================================
       * FALLBACK 404
       * =========================================================
       */
      return new Response(
        JSON.stringify({
          success: false,
          error: "Route not found",
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    } catch (error: any) {
      console.error("Worker Error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error:
            error?.message || "Internal Server Error",
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
};