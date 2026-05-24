export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (
      url.pathname === "/" ||
      url.pathname.startsWith("/assets") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".ico") ||
      url.pathname.endsWith(".html")
    ) {
      return env.ASSETS.fetch(request)
    }

    if (url.pathname.startsWith("/api")) {
      return new Response(
        JSON.stringify({ ok: true, route: url.pathname }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    return env.ASSETS.fetch(request)
  }
}
