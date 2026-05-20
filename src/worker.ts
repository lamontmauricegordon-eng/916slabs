export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // JWT Auth
    const auth = request.headers.get('Authorization');
    if (env.JWT_SECRET && auth) {
      const token = auth.replace('Bearer ', '');
      if (!token || token.length < 10) {
        return new Response('Unauthorized', { status: 401, headers: cors });
      }
    }

    try {
      // Health check
      if (url.pathname === '/health') {
        return Response.json({
          status: 'ok',
          worker: url.hostname,
          bindings: { AI: !!env.AI, BUCKET: !!env.BUCKET, KV_CACHE: !!env.KV_CACHE, EXPORT_LOGS: !!env.EXPORT_LOGS, FILE_SERVICE: !!env.FILE_SERVICE }
        }, { headers: cors });
      }

      // List files
      if (url.pathname === '/api/files' && request.method === 'GET') {
        const cached = await env.KV_CACHE.get('file_list', 'json');
        if (cached) return Response.json({ files: cached, cached: true }, { headers: cors });
        const listed = await env.BUCKET.list();
        const files = listed.objects.map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded }));
        await env.KV_CACHE.put('file_list', JSON.stringify(files), { expirationTtl: 300 });
        return Response.json({ files, cached: false }, { headers: cors });
      }

      // Upload file
      if (url.pathname === '/api/files' && request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) return Response.json({ error: 'No file' }, { status: 400, headers: cors });
        await env.BUCKET.put(file.name, file.stream());
        let description = null;
        try {
          const ai = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{ role: 'user', content: `Describe this slab file in 1 professional sentence: ${file.name}` }]
          });
          description = ai.response;
        } catch {}
        await env.KV_CACHE.put(`file:${file.name}`, JSON.stringify({ name: file.name, size: file.size, description, uploaded: new Date().toISOString() }));
        await env.KV_CACHE.delete('file_list');
        await env.EXPORT_LOGS.put(`log:${Date.now()}`, JSON.stringify({ action: 'upload', file: file.name, time: new Date().toISOString() }));
        return Response.json({ success: true, key: file.name, description }, { headers: cors });
      }

      // Download file
      if (url.pathname.startsWith('/api/files/') && request.method === 'GET') {
        const key = decodeURIComponent(url.pathname.replace('/api/files/', ''));
        const obj = await env.BUCKET.get(key);
        if (!obj) return Response.json({ error: 'Not found' }, { status: 404, headers: cors });
        return new Response(obj.body, { headers: { ...cors, 'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream' } });
      }

      // Delete file
      if (url.pathname.startsWith('/api/files/') && request.method === 'DELETE') {
        const key = decodeURIComponent(url.pathname.replace('/api/files/', ''));
        await env.BUCKET.delete(key);
        await env.KV_CACHE.delete(`file:${key}`);
        await env.KV_CACHE.delete('file_list');
        await env.EXPORT_LOGS.put(`log:${Date.now()}`, JSON.stringify({ action: 'delete', file: key, time: new Date().toISOString() }));
        return Response.json({ success: true }, { headers: cors });
      }

      // AI chat
      if (url.pathname === '/api/ai/chat' && request.method === 'POST') {
        const { message } = await request.json();
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: message }]
        });
        return Response.json({ response: response.response }, { headers: cors });
      }

      // AI product description
      if (url.pathname === '/api/ai/describe' && request.method === 'POST') {
        const { filename } = await request.json();
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: `Write a professional product description for a slab called "${filename}". Include material type, dimensions, use cases, and pricing tier.` }]
        });
        return Response.json({ description: response.response }, { headers: cors });
      }

      // Export logs
      if (url.pathname === '/api/logs' && request.method === 'GET') {
        const list = await env.EXPORT_LOGS.list();
        const logs = await Promise.all(list.keys.map(async k => ({ key: k.name, value: await env.EXPORT_LOGS.get(k.name, 'json') })));
        return Response.json({ logs }, { headers: cors });
      }

      return Response.json({ error: 'Not found' }, { status: 404, headers: cors });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: cors });
    }
  }
};
