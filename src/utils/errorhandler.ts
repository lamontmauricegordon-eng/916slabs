import { Logger } from './logger';

export function handleError(error: unknown, logger: Logger): Response {
  logger.error('Unhandled error', error instanceof Error ? error : new Error(String(error)));
  return new Response(
    JSON.stringify({ error: 'Internal Server Error' }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
