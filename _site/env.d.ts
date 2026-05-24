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
    // Main Bindings
    AI: Ai;
    KV: KVNamespace;
    R2: R2Bucket;
    WORKER_SERVICE: Fetcher;

    // Custom Bindings from your project
    Hung_slabs: any;           // KV or other binding
    Acct_API_slabs: any;       // Service / API binding

    // Optional future bindings
    // QUEUE?: Queue;
    // DB?: D1Database;
  }
}

// Helper type for convenience
export type Env = CloudflareEnvironment;
