export interface StatusResponse {
  ok: boolean;
  service: string;
  env: string;
  bindings: Record<string, boolean>;
}

export interface KVResponse {
  key: string;
  value: string | null;
  found: boolean;
}

export interface R2Object {
  key: string;
  size: number;
  uploaded: string;
}

export interface R2Response {
  bucket: string;
  objects: R2Object[];
}

export interface AIResponse {
  model: string;
  ok: boolean;
  response: string;
}

export interface ServiceResponse {
  ok: boolean;
  service: string;
  proxied: boolean;
  data: any;
}

export class SlabsAPI {
  private base: string;

  constructor(baseUrl: string = "https://916slabs.pages.dev/api") {
    this.base = baseUrl;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.base}${path}`);
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async status(): Promise<StatusResponse> {
    return this.get<StatusResponse>("/status");
  }

  async kv(key: string): Promise<KVResponse> {
    return this.get<KVResponse>(`/kv?key=${encodeURIComponent(key)}`);
  }

  async r2(): Promise<R2Response> {
    return this.get<R2Response>("/r2");
  }

  async ai(): Promise<AIResponse> {
    return this.get<AIResponse>("/ai");
  }

  async service(): Promise<ServiceResponse> {
    return this.get<ServiceResponse>("/service");
  }
}

export const slabs = new SlabsAPI();
