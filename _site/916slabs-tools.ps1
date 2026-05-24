param(
    [string]$mode = "dev"
)

Write-Host "== 916SLABS UNIFIED DEV =="

switch ($mode) {

    "dev" {
        Write-Host "== Starting Jekyll, Vite, and Wrangler =="

        # Start Jekyll build/watch
        Start-Process powershell -ArgumentList "jekyll build --watch" -WindowStyle Minimized

        # Start Vite dev server
        Start-Process powershell -ArgumentList "npm run vite" -WindowStyle Minimized

        # Start Wrangler Pages dev
        wrangler pages dev .
    }

    default {
        Write-Host "Unknown mode: $mode"
    }
}
