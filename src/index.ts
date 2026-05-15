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

    // Your existing routes...

    if (request.method === 'GET' && url.pathname === '/api/files') {
      const listed = await env.BUCKET.list();
      const files = listed.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        type: obj.httpMetadata?.contentType || 'unknown',
      }));
      return new Response(JSON.stringify({ files }), { headers });
    }

    // ... (add the rest of your routes)

    return new Response('Not Found', { status: 404, headers });
  },
};
