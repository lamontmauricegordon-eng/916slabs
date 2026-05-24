Write-Host '=== 916SLABS DEPLOY START ==='

# Clean build folders
if (Test-Path _site) {
    Remove-Item -Recurse -Force _site
    Write-Host 'Removed _site'
}

if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
    Write-Host 'Removed dist'
}

# Build Jekyll
Write-Host 'Building Jekyll'
jekyll build
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Jekyll build failed'
    exit 1
}
Write-Host 'Jekyll build OK'

# Build Vite
Write-Host 'Building Vite'
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Vite build failed'
    exit 1
}
Write-Host 'Vite build OK'

# Merge dist into _site
Write-Host 'Merging dist into _site'
Copy-Item -Recurse -Force dist/* _site/
Write-Host 'Merge OK'

# Check wrangler.toml
if (!(Test-Path wrangler.toml)) {
    Write-Host 'Missing wrangler.toml'
    exit 1
}

# Deploy Pages
Write-Host 'Deploying Cloudflare Pages'
wrangler pages deploy _site --project-name 916slabs
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Pages deploy failed'
    exit 1
}
Write-Host 'Pages deploy OK'

# Deploy Worker
Write-Host 'Deploying Worker'
wrangler deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Worker deploy failed'
    exit 1
}
Write-Host 'Worker deploy OK'

Write-Host '=== 916SLABS DEPLOY COMPLETE ==='
