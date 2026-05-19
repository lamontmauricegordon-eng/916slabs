export interface Env {
  Hung_slabs: string;
  Acct_API_slabs: string;

  BUCKET: R2Bucket;

  ENVIRONMENT: string;
  VERSION_METADATA: {
    id: string;
    tag: string;
  };
}
