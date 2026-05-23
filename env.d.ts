/// <reference types="@cloudflare/workers-types" />

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENVIRONMENT: string;
      SITE_URL: string;
      VERSION: string;
    }
  }
}

declare global {
  interface CloudflareEnvironment {
    AI: Ai;
    KV: KVNamespace;
    R2: R2Bucket;
    WORKER_SERVICE: Fetcher;
    // Add more bindings here as you enable them
  }
}
