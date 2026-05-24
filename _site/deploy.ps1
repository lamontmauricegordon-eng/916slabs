Write-Host "=== HYBRID DEPLOY START ==="

# Step 1: Build Jekyll site
Write-Host "Building Jekyll..."
jekyll build
if ($LASTEXITCODE -ne 0) { exit 1 }

# Step 2: Deploy static site to Cloudflare Pages
Write-Host "Deploying Pages (_site)..."
wrangler pages deploy _site
if ($LASTEXITCODE -ne 0) { exit 1 }

# Step 3: Deploy Worker API
Write-Host "Deploying Worker..."
wrangler deploy
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== DEPLOY COMPLETE ==="
