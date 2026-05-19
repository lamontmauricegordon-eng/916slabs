/* eslint-disable @typescript-eslint/no-explicit-any -- Reason: Temporary any for Cloudflare env types */
type Fetcher = {
  fetch(
    request: RequestInfo | Request,
    init?: RequestInit,
  ): Promise<Response>;
};

type KVNamespace = any;
type DurableObject = any;
type R2Bucket = 916-slabs;
type R2Object = any;

declare global {
  const ENVIRONMENT: string;
  const VERSION_METADATA: {
    id: string;
    tag: string;
  };
}

// Default fetch handler for Cloudflare Worker 
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const secretValue = env.Hung_slabs;
    return new Response(`Secret is set: ${env.Hung_slabs? 'Yes' : 'No'}`);
  }
};
