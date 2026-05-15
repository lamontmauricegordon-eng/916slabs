import { Logger } from './logger';

export function handleError(error: unknown, logger: Logger): Response {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (error instanceof Error) {
    logger.error(`Request failed: ${error.message}`, error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
      { status: 500, headers }
    );
  }

  logger.error('Unknown error occurred', error);
  return new Response(
    JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unknown error occurred',
    }),
    { status: 500, headers }
  );
}
