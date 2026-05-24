Write-Host "=== 916SLABS FULL PROJECT REPAIR ==="

# 1. Remove duplicate root folder
if (Test-Path "916slabs") {
    Remove-Item -Recurse -Force "916slabs"
    Write-Host "Removed stray 916slabs/ folder"
}

# 2. Create _pages if missing
if (!(Test-Path "_pages")) {
    New-Item -ItemType Directory "_pages" | Out-Null
    Write-Host "Created _pages/"
}

# 3. Move Jekyll pages into _pages
$jekyllPages = @("about.md", "blog.md", "index.md")
foreach ($file in $jekyllPages) {
    if (Test-Path $file) {
        Move-Item $file "_pages/" -Force
        Write-Host "Moved $file → _pages/"
    }
}

# 4. Delete garbage files
$deleteFiles = @("Gemfile.txt", "api-test.html")
foreach ($file in $deleteFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted $file"
    }
}

# 5. Move client.ts into src/
if (Test-Path "client.ts") {
    Move-Item "client.ts" "src/" -Force
    Write-Host "Moved client.ts → src/"
}

# 6. Delete public/ folder (Vite default)
if (Test-Path "public") {
    Remove-Item -Recurse -Force "public"
    Write-Host "Removed public/ folder"
}

# 7. Ensure dist/ exists
if (!(Test-Path "dist")) {
    New-Item -ItemType Directory "dist" | Out-Null
    Write-Host "Created dist/"
}

# 8. Ensure _site/ exists
if (!(Test-Path "_site")) {
    New-Item -ItemType Directory "_site" | Out-Null
    Write-Host "Created _site/"
}

# 9. Patch wrangler.toml
@"
name = "916slabs"
main = "functions/index.ts"
compatibility_date = "2026-05-23"

[site]
bucket = "./_site"

[[kv_namespaces]]
binding = "KV_SLABS"
id = "__916slabs1-workers_sites_assets"

[[r2_buckets]]
binding = "R2_SLABS"
bucket_name = "916-slabs-bucket"

[[services]]
binding = "AG_BELL_SLABS"
service = "916-slabs"

[ai]
binding = "AI_SLABS"

[vars]
ENVIRONMENT = "production"
"@ | Set-Content -Path "wrangler.toml"
Write-Host "Patched wrangler.toml"

# 10. Patch vite.config.js
@"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true
  },
  base: "/",
  optimizeDeps: {
    exclude: ["@cloudflare/workers-types"]
  }
})
"@ | Set-Content -Path "vite.config.js"
Write-Host "Patched vite.config.js"

# 11. Patch Jekyll config
@"
title: "916SLABS"
description: "916SLABS Hybrid Jekyll + Vite + Cloudflare Worker App"
baseurl: ""
url: ""

markdown: kramdown
highlighter: rouge

theme: minima

plugins:
  - jekyll-feed
  - jekyll-seo-tag

include:
  - _pages
  - _posts
  - assets
  - dist

exclude:
  - node_modules
  - package.json
  - package-lock.json
  - vite.config.js
  - wrangler.toml
  - functions
  - .wrangler
  - dist
  - Gemfile
  - Gemfile.lock

destination: "./_site"

sass:
  style: compressed

permalink: /:categories/:title/
"@ | Set-Content -Path "_config.yml"
Write-Host "Patched _config.yml"

# 12. Patch Worker routing
@"
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
"@ | Set-Content -Path "functions/index.ts"
Write-Host "Patched Worker routing"

Write-Host "=== 916SLABS PROJECT FULLY REPAIRED ==="
