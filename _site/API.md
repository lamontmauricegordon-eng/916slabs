916SLABS API Documentation

Base URL
https://916slabs.pages.dev/api

Status Endpoint
GET /api/status
Returns backend health and binding availability.

Example response:
{
"ok": true,
"service": "916slabs-backend",
"env": "production",
"bindings": {
"KV_SLABS": true,
"R2_SLABS": true,
"AI_SLABS": true,
"AG_BELL_SLABS": true
}
}

KV Endpoint
GET /api/kv?key=<name>
Reads a value from the KV_SLABS namespace.

Example response when found:
{
"key": "example",
"value": "stored value",
"found": true
}

Example response when missing:
{
"key": "missing",
"value": null,
"found": false
}

R2 Endpoint
GET /api/r2
Lists objects in the R2_SLABS bucket.

Example response:
{
"bucket": "916-slabs-bucket",
"objects": [
{
"key": "file1.jpg",
"size": 245760,
"uploaded": "2026-05-23T19:30:00.000Z"
},
{
"key": "file2.json",
"size": 1024,
"uploaded": "2026-05-23T19:31:00.000Z"
}
]
}

Workers AI Endpoint
GET /api/ai
Runs a test prompt against the AI_SLABS binding.

Example response:
{
"model": "@cf/meta/llama-3.1-8b-instruct",
"ok": true,
"response": "This is a test response from Workers AI."
}

Service Binding Endpoint
GET /api/service
Calls the AG_BELL_SLABS service binding (Worker: 916-slabs).

Example response:
{
"ok": true,
"service": "AG_BELL_SLABS",
"proxied": true,
"data": {
"status": "ok",
"worker": "916-slabs"
}
}

Error Format
All errors follow this structure:

{
"ok": false,
"error": "Human-readable error message"
}