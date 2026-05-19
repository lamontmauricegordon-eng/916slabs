/* eslint-disable @typescript-eslint/no-explicit-any */

type Fetcher = {
  fetch(
    request: RequestInfo | Request,
    init?: RequestInit,
  ): Promise<Response>;
};

type KVNamespace = any;
type DurableObject = any;
type R2Bucket = any;
type R2Object = any;

declare global {
  const ENVIRONMENT: string;
  const VERSION_METADATA: {
    id: string;
    tag: string;
  };
}

// Default fetch handler for Cloudflare Workers
export default {
  fetch(request: Request, env: { [key: string]: any }): Promise<Response> {
    return new Response(`Hello from ${ENVIRONMENT}, version ${VERSION_METADATA.id}`);
  }
};
