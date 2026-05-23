import { Env } from "./env";

// Export the Workflow so Cloudflare can find it
export { ContentProcessorWorkflow } from "./workflows/content-processor";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const hung = env.Hung_slabs;
    const acct = env.Acct_API_slabs;

    return new Response(
      JSON.stringify(
        {
          status: "916slabs backend is running",
          Hung_slabs: hung ? "Yes (bound)" : "No (missing)",
          Acct_API_slabs: acct ? "Yes (bound)" : "No (missing)",
          environment: env.ENVIRONMENT || "production",
          timestamp: new Date().toISOString()
        },
        null,
        2
      ),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    );
  }
};
