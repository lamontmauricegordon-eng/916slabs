// src/index.ts
export { ContentProcessorWorkflow } from "./workflows/content-processor";

// Optional default handler
export default {
  async fetch() {
    return new Response("916slabs backend is active.", { status: 200 });
  }
};
