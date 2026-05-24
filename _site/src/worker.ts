import { Env } from "./env";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const hung = env.Hung_slabs;
    const acct = env.Acct_API_slabs;

    return new Response(
      JSON.stringify(
        {
          Hung_slabs: hung ? "Yes" : "No",
          Acct_API_slabs: acct ? "Yes" : "No"
        },
        null,
        2
      ),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
