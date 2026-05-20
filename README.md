916SLABS — README.md
# 🪨 916SLABS

**Professional Slab Inventory & AI Platform**

Built on Cloudflare's global edge network. Upload, manage, describe, and sell slabs — powered by AI.

---

## 🌐 Live URLs

| Service | URL |
|---|---|
| **Website** | [916slabs.pages.dev](https://916slabs.pages.dev) |
| **Primary API** | [916-slabs.7n5jtczfjs.workers.dev](https://916-slabs.7n5jtczfjs.workers.dev) |
| **Secondary API** | [916slabs.7n5jtczfjs.workers.dev](https://916slabs.7n5jtczfjs.workers.dev) |
| **Tertiary API** | [816.7n5jtczfjs.workers.dev](https://816.7n5jtczfjs.workers.dev) |

---

## 🏗️ Architecture

                ┌─────────────────────────┐
                │    916slabs.pages.dev    │
                │    (Jekyll + Functions)  │
                └────────────┬────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
"A.G. Bell slabs" "Nokia brick" "Tesla slabs" │ │ │ ▼ ▼ ▼ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │ 916-slabs │ │ 916slabs │ │ 816 │ │ (Worker) │ │ (Worker) │ │ (Worker) │ └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ │ │ │ └────────────────────┼────────────────────┘ │ ┌────────────────┼────────────────┐ │ │ │ ▼ ▼ ▼ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ R2: 916-slabs│ │KV: 916-slabs-kv│ │KV: EXPORT_LOGS│ └──────────────┘ └──────────────┘ └──────────────┘ │ ▼ ┌──────────────┐ │ Workers AI │ └──────────────┘


### Supporting Workers

| Worker | Role |
|---|---|
| `ancient-lake-aa3f` | JWT authentication proxy + export logging |
| `misty-wood-4fa6` | AI demo & testing |
| `snowy-tooth-8aa6` | JWT proxy + extended storage |

---

## 📦 API Reference

### Health Check

GET /health


```json
{
  "status": "ok",
  "worker": "916-slabs",
  "bindings": {
    "AI": true,
    "BUCKET": true,
    "KV_CACHE": true,
    "EXPORT_LOGS": true,
    "FILE_SERVICE": true
  }
}
List Files
GET /api/files
{
  "files": [
    {
      "key": "calacatta-gold.jpg",
      "size": 245760,
      "uploaded": "2026-05-20T14:30:00.000Z"
    }
  ],
  "cached": true
}
Results are cached in KV for 5 minutes. Cache auto-clears on upload/delete.

Upload File
POST /api/files
Content-Type: multipart/form-data
Field	Type	Required
file	File	✅
{
  "success": true,
  "key": "calacatta-gold.jpg",
  "description": "A polished Calacatta Gold marble slab featuring bold gold veining, ideal for luxury kitchen countertops and statement islands."
}
AI auto-generates a product description on upload.

Download File
GET /api/files/{key}
Returns the raw file with appropriate Content-Type.

Delete File
DELETE /api/files/{key}
{
  "success": true
}
AI Chat
POST /api/ai/chat
Content-Type: application/json
{
  "message": "What granite slabs do you recommend for outdoor kitchens?"
}
{
  "response": "For outdoor kitchens, I'd recommend Uba Tuba granite for its dark elegance and weather resistance, or Absolute Black granite for a sleek, modern look that handles UV exposure well..."
}
AI Product Description
POST /api/ai/describe
Content-Type: application/json
{
  "filename": "Calacatta-Gold-Marble-Slab"
}
{
  "description": "Calacatta Gold Marble is a premium natural stone featuring a crisp white background with dramatic gold and gray veining. Sourced from Italian quarries, this slab is ideal for luxury countertops, backsplashes, and feature walls. Pricing tier: Premium."
}
Activity Logs
GET /api/logs
{
  "logs": [
    {
      "key": "log:1747747200000",
      "value": {
        "action": "upload",
        "file": "calacatta-gold.jpg",
        "time": "2026-05-20T14:30:00.000Z"
      }
    }
  ]
}
🔐 Authentication
Protected endpoints require a JWT Bearer token:

curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://916-slabs.7n5jtczfjs.workers.dev/api/files
Secrets are stored encrypted in Cloudflare and never exposed in code.

🚀 Quick Start
Prerequisites
Node.js v18+
Wrangler CLI
Cloudflare account
Install
git clone https://github.com/lamontmauricegordon-eng/916slabs.git
cd 916slabs
npm install
Configure
# Login to Cloudflare
npx wrangler login

# Set secrets (run for each Worker)
for WORKER in 816 916-slabs 916slabs ancient-lake-aa3f misty-wood-4fa6 snowy-tooth-8aa6; do
  echo "YOUR_JWT_SECRET" | npx wrangler secret put JWT_SECRET --name $WORKER
  echo "YOUR_API_KEY" | npx wrangler secret put Acct_API_slabs --name $WORKER
done
Deploy
npx wrangler deploy
Verify
curl https://916-slabs.7n5jtczfjs.workers.dev/health
📁 Project Structure
916slabs/
├── src/
│   └── index.js          # Worker API code
├── functions/             # Pages Functions
│   └── api/
│       ├── files.js       # File proxy to Workers
│       ├── ai/
│       │   ├── chat.js    # AI chat endpoint
│       │   └── describe.js # AI description endpoint
│       └── logs.js        # Activity logs
├── _site/                 # Jekyll build output
├── _config.yml            # Jekyll configuration
├── wrangler.toml          # Worker bindings & config
├── package.json
└── README.md
🔧 Configuration
Worker Bindings (wrangler.toml)
name = "916-slabs"
main = "src/index.js"
compatibility_date = "2024-12-01"

[ai]
binding = "AI"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "916-slabs"

[[kv_namespaces]]
binding = "KV_CACHE"
id = "27e94f03c5414afea22cc2c9bfbe1ec8"

[[kv_namespaces]]
binding = "EXPORT_LOGS"
id = "6e9d7e858bc44719ad56f6a5ec1ff1af"

[[services]]
binding = "FILE_SERVICE"
service = "916-slabs"
Pages Functions — Using Bindings
// Call a Worker via service binding (no HTTP, internal only)
const response = await context.env['A.G. Bell slabs'].fetch(
  new Request('https://internal/api/files')
);

// Use AI directly from Pages
const answer = await context.env['AI slabs'].run(
  '@cf/meta/llama-3.1-8b-instruct',
  { messages: [{ role: 'user', content: 'Describe a premium marble slab' }] }
);

// Access R2 directly from Pages
const obj = await context.env['R2 slabs'].get('calacatta-gold.jpg');

// Read/write KV directly from Pages
await context.env['KV slabs'].put('key', 'value');
const value = await context.env['KV slabs'].get('key');
🛡️ Security
Feature	Status	Details
JWT Authentication	✅	Encrypted secrets, Bearer token
CORS	⚠️ Open	Set to * — restrict before launch
Encrypted Secrets	✅	JWT_SECRET, Acct_API_slabs, Hung_slabs
Service Bindings	✅	Internal-only Worker-to-Worker calls
R2 Access	✅	Bucket-level, not public
Restrict CORS for Production
In src/index.js, change:

'Access-Control-Allow-Origin': '*'
To:

'Access-Control-Allow-Origin': 'https://yourdomain.com'
📊 Monitoring
View Worker Metrics
# Dashboard: Workers & Pages → select Worker → Metrics tab
# Or use GraphQL Analytics API
Check Health
# All Workers at once
for W in 816 916-slabs 916slabs ancient-lake-aa3f misty-wood-4fa6 snowy-tooth-8aa6; do
  echo "=== $W ==="
  curl -s https://$W.7n5jtczfjs.workers.dev/health | jq .
done
View Logs
curl https://916-slabs.7n5jtczfjs.workers.dev/api/logs | jq .
🐛 Troubleshooting
Issue	Solution
Binding shows false in /health	Re-add binding in Dashboard → Worker → Settings → Bindings
AI returns error	Check Workers AI is enabled on your account
File upload fails	Verify R2 bucket 916-slabs exists
KV cache stale	Cache auto-expires in 5 min, or clear with upload/delete
401 Unauthorized	Check JWT_SECRET is set and token is valid
CORS error	Verify Access-Control-Allow-Origin header
✅ Production Launch Checklist
 All 6 /health endpoints return true for every binding
 File upload/download/delete works end-to-end
 AI descriptions generate correctly
 AI chat responds accurately
 Custom domain connected to Pages project
 CORS restricted to your domain only
 JWT auth tested with real tokens
 Activity logs recording correctly
 Error monitoring enabled
 Rate limiting configured (WAF rules)
 Secrets rotated from placeholder values
 SSL/TLS set to Full (Strict)
📈 Scaling
This architecture scales automatically. Cloudflare Workers run on 300+ cities worldwide. No server management needed.

Resource	Free Tier	Paid
Workers	100K requests/day	$0.50/million
R2 Storage	10 GB	$0.015/GB/month
R2 Operations	1M Class A, 10M Class B	$4.50/million Class A
KV Reads	100K/day	$0.50/million
KV Writes	1K/day	$5.00/million
Workers AI	10K neurons/day	Varies by model
📄 License
Private — All rights reserved.

🤝 Support
Dashboard: dash.cloudflare.com
Docs: developers.cloudflare.com
Status: cloudflarestatus.com
Built with ❤️ on Cloudflare's global edge network.


---

Copy this into your repo as `README.md`. Want me to also generate the `wrangler.toml` files for a
