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

      // Download
      if (request.method === 'GET' && url.pathname === '/api/files/download') {
        const name = url.searchParams.get('name');
        if (!name) return new Response(JSON.stringify({ error: 'Missing ?name=' }), { status: 400, headers });

        const object = await env.BUCKET.get(name);
        if (!object) return new Response(JSON.stringify({ error: 'File not found' }), { status: 404, headers });

        return new Response(object.body, {
          headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${name.split('/').pop()}"`,
          },
        });
      }

      // Upload
      if (request.method === 'POST' && url.pathname === '/api/files/upload') {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers });

        const key = `BinderExports/${file.name}`;
        await env.BUCKET.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });
        return new Response(JSON.stringify({ message: 'Uploaded!', key }), { status: 201, headers });
      }

      // Delete
      if (request.method === 'DELETE' && url.pathname === '/api/files') {
        const name = url.searchParams.get('name');
        if (!name) return new Response(JSON.stringify({ error: 'Missing ?name=' }), { status: 400, headers });

        await env.BUCKET.delete(name);
        return new Response(JSON.stringify({ message: 'Deleted!', key: name }), { headers });
      }

      return new Response('Not Found', { status: 404, headers });

    } catch (error: any) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message || 'Internal error' }), { 
        status: 500, 
        headers 
      });
    }
  },
};
