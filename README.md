916SLABS — Hybrid Cloudflare Pages + Workers Backend



916SLABS is a hybrid application built on Cloudflare Pages, combining a Jekyll‑powered frontend with a Cloudflare Pages Functions backend.
The backend integrates Cloudflare KV, R2, Workers AI, and a service binding to deliver a fast, global, serverless API layer.

This architecture is optimized for simplicity, reliability, and modular expansion.

🚀 Architecture Overview

Frontend

Built with Jekyll

Deployed through Cloudflare Pages

Output directory: _site/

Handles all non‑API routes

Backend

Implemented using Cloudflare Pages Functions

Single unified router: functions/_middleware.js

Handles all /api/* routes

Automatically receives Cloudflare bindings

Cloudflare Bindings (from wrangler.toml)

KV_SLABS → KV Namespace

R2_SLABS → R2 Bucket

AI_SLABS → Workers AI

AG_BELL_SLABS → Service Binding

📁 Project Structure

916slabs/
_config.yml
_layouts/
_includes/
_posts/
public/
src/
functions/
_middleware.js
wrangler.toml
package.json
tsconfig.json
env.d.ts
README.md

🧠 Backend API Routes

All backend routes are served from /api/* via functions/_middleware.js.

Status
GET /api/status
Returns environment info and confirms backend health.

KV
GET /api/kv?key=<name>
Reads a value from the KV namespace.

R2
GET /api/r2
Lists objects in the R2 bucket.

Workers AI
GET /api/ai
Runs a prompt against Cloudflare Workers AI.

Service Binding
GET /api/service
Calls the bound Worker service (916-slabs).

🛠 Development

Local Development
npm run dev
Launches Jekyll + Functions + local bindings.

Build Jekyll
npm run build

Deploy Worker (optional)
npm run deploy

📦 Tooling

Includes:

TypeScript

ESLint + Prettier

Cloudflare Wrangler

Workers Types

Linting
npm run lint
npm run lint:fix

Type Checking
npm run type-check

☁️ Deployment

Deployment is automatic on push to main.

Cloudflare Pages will:

Install dependencies

Run jekyll build

Deploy _site

Deploy Functions from /functions

Attach KV, R2, AI, and service bindings

Route /api/* to backend

Route everything else to Jekyll

🔐 Environment & Bindings

Bindings from wrangler.toml:

KV_SLABS
R2_SLABS
AG_BELL_SLABS
AI_SLABS

These are automatically injected into the runtime environment.

📄 License

MIT License
Copyright © 2026



