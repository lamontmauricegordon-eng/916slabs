import { Logger } from './utils/logger';
import { handleError } from './utils/errorHandler';

const logger = new Logger();

interface Env {
  BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      logger.info(`Processing ${request.method} request to ${request.url}...`);
      const url = new URL(request.url);
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      // CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      // GET /api/endpoint
      if (request.method === 'GET' && url.pathname === '/api/endpoint') {
        return new Response(JSON.stringify({ message: 'Hello from 916slabs!' }), { headers });
      }

      // POST /api/endpoint
      if (request.method === 'POST' && url.pathname === '/api/endpoint') {
        const body = await request.json();
        return new Response(JSON.stringify({ message: 'POST received!', body }), { headers });
      }

      // GET /api/files — list all files
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

      // GET /api/files/download?name=key — download a file
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

      // POST /api/files/upload — upload a file
      if (request.method === 'POST' && url.pathname === '/api/files/upload') {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers });
        }
        const key = `BinderExports/${file.name}`;
        await env.BUCKET.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });
        return new Response(JSON.stringify({ message: 'Uploaded!', key }), { status: 201, headers });
      }

      // DELETE /api/files?name=key — delete a file
      if (request.method === 'DELETE' && url.pathname === '/api/files') {
        const name = url.searchParams.get('name');
        if (!name) {
          return new Response(JSON.stringify({ error: 'Missing ?name=' }), { status: 400, headers });
        }
        await env.BUCKET.delete(name);
        return new Response(JSON.stringify({ message: 'Deleted!', key: name }), { headers });
      }

      // Fallback for unknown routes
      return new Response('Not Found', { status: 404, headers });
    } catch (error) {
      return handleError(error, logger);
    }
  },
};
