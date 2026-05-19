interface Env {
  BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // Test endpoint
      if (request.method === 'GET' && url.pathname === '/api/endpoint') {
        return new Response(JSON.stringify({ message: 'Hello from 916slabs!' }), { headers });
      }

      // POST test
      if (request.method === 'POST' && url.pathname === '/api/endpoint') {
        const body = await request.json();
        return new Response(JSON.stringify({ message: 'POST received!', body }), { headers });
      }

      // List files
      if (request.method === 'GET' && url.pathname === '/api/files') {
        const listed = await env.BUCKET.list();
        const files = listed.objects.map((obj: any) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          type: obj.httpMetadata?.contentType || 'unknown',
        }));
        return new Response(JSON.stringify({ files }), { headers });
      }

      // Download file
      if (request.method === 'GET' && url.pathname === '/api/files/download') {
        const name = url.searchParams.get('name');
        if (!name) {
          return new Response(JSON.stringify({ error: 'Missing ?name=' }), { status: 400, headers });
        }

        const object = await env.BUCKET.get(name);
        if (!object) {
          return new Response(JSON.stringify({ error: 'File not found' }), { status: 404, headers });
        }

        return new Response(object.body, {
          headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${name.split('/').pop()}"`,
          },
        });
      }

      // Upload file
      if (request.method === 'POST' && url.pathname === '/api/files/upload') {
        const formData = await request.formData();
        const file = formData.get('file') as File | null
