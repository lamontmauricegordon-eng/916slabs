export const onRequest = async (ctx) => {
  const url = new URL(ctx.request.url);
  const { KV_SLABS, R2_SLABS, AI_SLABS, AG_BELL_SLABS } = ctx.env;

  // -----------------------------
  // STATUS ENDPOINT
  // -----------------------------
  if (url.pathname === "/api/status") {
    return new Response(
      JSON.stringify({
        ok: true,
        message: "916SLABS backend online",
        bindings: Object.keys(ctx.env)
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // -----------------------------
  // KV ENDPOINT
  // /api/kv?key=foo
  // -----------------------------
  if (url.pathname.startsWith("/api/kv")) {
    const key = url.searchParams.get("key") || "test-key";
    const value = await KV_SLABS.get(key);

    return new Response(
      JSON.stringify({ key, value }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // -----------------------------
  // R2 ENDPOINT
  // /api/r2
  // -----------------------------
  if (url.pathname.startsWith("/api/r2")) {
    const list = await R2_SLABS.list();
    return new Response(JSON.stringify(list), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // -----------------------------
  // AI ENDPOINT
  // /api/ai
  // -----------------------------
  if (url.pathname.startsWith("/api/ai")) {
    const result = await AI_SLABS.run("@cf/meta/llama-3.1-8b-instruct", {
      prompt: "Say hello to Lamont from 916SLABS."
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // -----------------------------
  // SERVICE BINDING ENDPOINT
  // /api/service
  // -----------------------------
  if (url.pathname.startsWith("/api/service")) {
    const response = await AG_BELL_SLABS.fetch("http://internal/status");
    return response;
  }

  // -----------------------------
  // DEFAULT → LET JEKYLL HANDLE IT
  // -----------------------------
  return ctx.next();
};
