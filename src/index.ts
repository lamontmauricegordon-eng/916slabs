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

      // Handle GET requests to /api/endpoint
      if (request.method === "GET" && url.pathname === '/api/endpoint') {
        return new Response(
          JSON.stringify({ message: "Hello from 916slabs!" }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            },
          }
        );
      }

      // Handle POST requests to /api/endpoint (if needed)
      if (request.method === "POST" && url.pathname === '/api/endpoint') {
        const body = await request.json();
        return new Response(
          JSON.stringify({ message: "POST received!", body }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            },
          }
        );
      }

      // Handle OPTIONS for CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      // Fallback for unknown routes/methods
      return new Response('Not Found', {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return handleError(error, logger);
    }
  },
};
