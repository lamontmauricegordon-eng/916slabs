import { Logger } from './utils/logger';
import { handleError } from './utils/errorHandler';

// Initialize logger
const logger = new Logger();

// Cloudflare Workers environment type
interface Env {
  BUCKET: R2Bucket; // Binding for your R2 bucket (matches wrangler.json)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      logger.info('Processing request...');
      const url = new URL(request.url);

      // API endpoint
      if (url.pathname === '/api/endpoint') {
        return new Response(
          JSON.stringify({ message: "Hello from 916slabs!" }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Example: List files in R2 bucket (if needed)
      if (url.pathname === '/api/list-files') {
        const files = await env.BUCKET.list();
        return new Response(
          JSON.stringify({ files: files.objects.map(obj => obj.key) }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Fallback for unknown routes
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return handleError(error, logger);
    }
  },
};
