param(
    [ValidateSet("install","uninstall","dev","deploy")]
    [string]$mode = "install"
)

function Write-FileFromBase64($path, $b64) {
    $bytes = [System.Convert]::FromBase64String($b64)
    $dir = Split-Path $path
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    [System.IO.File]::WriteAllBytes($path, $bytes)
}

function Install-Theme {
    Write-Host "== INSTALLING 916SLABS THEME =="

    $dirs = @(
        "_layouts",
        "_includes",
        "_sass",
        "assets",
        "assets/css",
        "assets/js",
        "_posts",
        ".github/workflows"
    )
    foreach ($d in $dirs) {
        if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null }
    }

    # -------- Base64 payloads --------

    $defaultLayout = @"
PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIiBkYXRhLXRoZW1lPSJkYXJrIj4KPGhlYWQ+CiAg
JXsgSW5jbHVkZSBoZWFkLmh0bWwgJX0KPC9oZWFkPgo8Ym9keT4KICAleyBJbmNsdWRlIGhlYWRlci5o
dG1sIH19CiAgPG1haW4gY2xhc3M9ImNvbnRhaW5lciI+CiAgICB7eyBjb250ZW50IH19CiAgPC9tYWlu
PgogIHsgSW5jbHVkZSBmb290ZXIuaHRtbCB9fQogIDxzY3JpcHQgc3JjPSIvYXNzZXRzL2pzL21haW4u
anMiPjwvc2NyaXB0Pgo8L2JvZHk+CjwvaHRtbD4=
"@

    $pageLayout = @"
LS0tCmxheW91dDogZGVmYXVsdAotLS0KCjxzZWN0aW9uIGNsYXNzPSJwYWdlIj4KICA8aDE+e3sgcGFn
ZS50aXRsZSB9fTwvaDE+CiAge3sgY29udGVudCB9fQogIDwvc2VjdGlvbj4=
"@

    $postLayout = @"
LS0tCmxheW91dDogZGVmYXVsdAotLS0KCjxhcnRpY2xlIGNsYXNzPSJwb3N0Ij4KICA8aDE+e3sgcGFn
ZS50aXRsZSB9fTwvaDE+CiAgPHA+e3sgcGFnZS5kYXRlIHwgZGF0ZTogIiVCIGQlLCAleSIgfX08L3A+
CiAge3sgY29udGVudCB9fQogIDwvYXJ0aWNsZT4=
"@

    $headInclude = @"
PG1ldGEgY2hhcnNldD0idXRmLTgiPgogPHRpdGxlPnt7IHBhZ2UudGl0bGUgfX0gfCB7eyBzaXRlLnRp
dGxlIH19PC90aXRsZT4KPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSIvYXNzZXRzL2Nzcy9tYWlu
LmNzcyI+CjxtZXRhIG5hbWU9InZpZXdwb3J0IiBjb250ZW50PSJ3aWR0aD1kZXZpY2Utd2lkdGgsIGlu
aXRpYWwtc2NhbGU9MSI+
"@

    $headerInclude = @"
PGhlYWRlciBjbGFzcz0ic2l0ZS1oZWFkZXIiPgogIDxuYXY+CiAgICA8YSBocmVmPSIvIiBjbGFzcz0i
e3sgaWYgcGFnZS51cmwgPT0gJy8nIH19YWN0aXZle3sgZW5kaWYgfX0iPkhvbWU8L2E+CiAgICA8YSBo
cmVmPSIvYWJvdXQiIGNsYXNzPSJ7eyBpZiBwYWdlLnVybCBjb250YWlucyAnYWJvdXQnIH19YWN0aXZl
e3sgZW5kaWYgfX0iPkFib3V0PC9hPgogICAgPGEgaHJlZj0iL2Jsb2ciIGNsYXNzPSJ7eyBpZiBwYWdl
LnVybCBjb250YWlucyAnYmxvZycgfX1hY3RpdmV7eyBlbmRpZiB9fSI+QmxvZzwvYT4KICAgIDxidXR0
b24gaWQ9InRoZW1lLXRvZ2dsZSI+8J+MjPC9idXR0b24+CiAgPC9uYXY+CjwvaGVhZGVyPg==
"@

    $footerInclude = @"
PGZvb3RlciBjbGFzcz0ic2l0ZS1mb290ZXIiPgogIDxwPiZjb3B5OyB7eyBzaXRlLnRpbWUgfCBkYXRl
OiAlWSB9fSB7eyBzaXRlLnRpdGxlIH19PC9wPgo8L2Zvb3Rlcj4=
"@

    $baseScss = @"
Ym9keSB7CiAgbWFyZ2luOiAwOwogIGZvbnQtZmFtaWx5OiBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7CiAg
YmFja2dyb3VuZDogIzA1MDYwODsKICBjb2xvcjogI2Y1ZjVmNTsKfQphIHsKICBjb2xvcjogIzRmZDFj
NTsKfQphLmFjdGl2ZSB7CiAgZm9udC13ZWlnaHQ6IGJvbGQ7Cn0KLmNvbnRhaW5lciB7CiAgbWF4LXdp
ZHRoOiA5MDBweDsKICBtYXJnaW46IDJyZW0gYXV0bzsKICBwYWRkaW5nOiAxcmVtOwp9
"@

    $layoutScss = @"
LnNpdGUtaGVhZGVyLCAuc2l0ZS1mb290ZXIgewogIG1heC13aWR0aDogOTAwcHg7CiAgbWFyZ2luOiAw
IGF1dG87CiAgcGFkZGluZzogMXJlbTsKfQpuYXYgYSB7IG1hcmdpbi1yaWdodDogMXJlbTsgfQ==
"@

    $componentsScss = @"
I3RoZW1lLXRvZ2dsZSB7CiAgYmFja2dyb3VuZDogbm9uZTsKICBib3JkZXI6IG5vbmU7CiAgY29sb3I6
ICM0ZmQxYzU7CiAgY3Vyc29yOiBwb2ludGVyOwogIGZvbnQtc2l6ZTogMS4ycmVtOwp9
"@

    $mainScss = @"
QGltcG9ydCAiYmFzZSI7CkBpbXBvcnQgImxheW91dCI7CkBpbXBvcnQgImNvbXBvbmVudHMiOw==
"@

    $mainJs = @"
Y29uc29sZS5sb2coIjkxNiBTbGFicyB0aGVtZSBsb2FkZWQiKTsKZG9jdW1lbnQuZ2V0RWxlbWVudEJ5
SWQoInRoZW1lLXRvZ2dsZSIpPy5hZGRFdmVudExpc3RlbmVyKCJjbGljayIsICgpID0+IHsKICBjb25z
dCBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50OwogIGNvbnN0IGN1cnJlbnQgPSBodG1sLmdl
dEF0dHJpYnV0ZSgiZGF0YS10aGVtZSIpOwogIGh0bWwuc2V0QXR0cmlidXRlKCJkYXRhLXRoZW1lIiwg
Y3VycmVudCA9PT0gImRhcmsiID8gImxpZ2h0IiA6ICJkYXJrIik7Cn0pOwoKYXN5bmMgZnVuY3Rpb24g
bG9hZEFQSSgpIHsKICB0cnkgewogICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goImh0dHA6Ly8xMjcu
MC4wLjE6ODc4OC9hcGkvc3RhdHVzIik7CiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTsK
ICAgIGNvbnNvbGUubG9nKCJCYWNrZW5kIEFQSSIsIGRhdGEpOwogIH0gY2F0Y2ggeyBjb25zb2xlLndh
cm4oIkFQSSBvZmZsaW5lIikgfQp9bG9hZEFQSSgpOw==
"@

    $configYml = @"
dGl0bGU6ICI5MTYgU2xhYnMiCmRlc2NyaXB0aW9uOiAiSmVreWxsICsgQ2xvdWRmbGFyZSBIeWJyaWQi
CmJhc2V1cmw6ICIiCnVybDogIiIKCm1hcmtkb3duOiBrcmFtZG93bgp0aGVtZTogbnVsbAoKc2Fzczog
CiAgc2Fzc19kaXI6IF9zYXNzCiAgc3R5bGU6IGNvbXByZXNzZWQKCmNvbGxlY3Rpb25zOgogIHBvc3Rz
OgogICAgb3V0cHV0OiB0cnVlCg==
"@

    $indexMd = @"
LS0tCmxheW91dDogcGFnZQp0aXRsZTogSG9tZQotLS0KCgkjIFdlbGNvbWUgdG8gOTE2IFNsYWJzCgpB
IGh5YnJpZCBKZWt5bGwgKyBDbG91ZGZsYXJlIHBsYXRmb3JtLgoKVGhpcyBzaXRlIHdhcyBidWlsdCBi
eSBhIHNjcmlwdC4=
"@

    $aboutMd = @"
LS0tCmxheW91dDogcGFnZQp0aXRsZTogQWJvdXQKLS0tCgo5MTYgU2xhYnMgaXMgYSBjdXN0b20tYnVp
bHQgcGxhdGZvcm0gdXNpbmc6CgotIEpla3lsbCAoUnVieSA0IGNvbXBhdGlibGUpCi0gQ2xvdWRmbGFy
ZSBQYWdlcyBGdW5jdGlvbnMKLSBDdXN0b20gdGhlbWUKLSBEYXJrIG1vZGUKLSBBUEkgaW50ZWdyYXRp
b24K
"@

    $blogMd = @"
LS0tCmxheW91dDogcGFnZQp0aXRsZTogQmxvZwotLS0KCgkjIEJsb2cKCnslIGZvciBwb3N0IGluIHNp
dGUucG9zdHMgJX0KLSBbeysgcG9zdC50aXRsZSB9XSgveyBwb3N0LnVybCB9KQp7JSBlbmQgJX0=
"@

    $postSample = @"
LS0tCmxheW91dDogcG9zdAp0aXRsZTogIldlbGNvbWUgdG8gdGhlIEJsb2ciCmRhdGU6IDIwMjYtMDUt
MjMKLS0tCgpUaGlzIGlzIHlvdXIgZmlyc3QgYmxvZyBwb3N0Lg==
"@

    $workflow = @"
bmFtZTogRGVwbG95IDkxNnNsYWJzIHRvIENsb3VkZmxhcmUgUGFnZXMKCm9uOgogIHB1c2g6CiAgICBi
cmFuY2hlczoKICAgICAgLSBtYWluCgpqb2JzOgogIGRlcGxveToKICAgIHJ1bnMtb246IHVidW50dS1s
YXRlc3QKCiAgICBzdGVwczoKICAgICAgLSBuYW1lOiBDaGVja291dCByZXBvCiAgICAgICAgdXNlczog
YWN0aW9ucy9jaGVja291dEB2NAogICAgICAtIG5hbWU6IFNldHVwIFJ1YnkKICAgICAgICB1c2VzOiBy
dWJ5L3NldHVwLXJ1YnlAdjEKICAgICAgICB3aXRoOgogICAgICAgICAgcnVieS12ZXJzaW9uOiAnMy4z
JwogICAgICAgICAgYnVuZGxlci1jYWNoZTogdHJ1ZQogICAgICAtIG5hbWU6IEluc3RhbGwgSmVreWxs
IGRlcGVuZGVuY2llcwogICAgICAgIHJ1bjogYnVuZGxlIGluc3RhbGwKICAgICAgLSBuYW1lOiBCdWls
ZCBKZWt5bGwgc2l0ZQogICAgICAgIHJ1bjogYnVuZGxlIGV4ZWMgamVreWxsIGJ1aWxkCiAgICAgIC0g
bmFtZTogUHVibGlzaCB0byBDbG91ZGZsYXJlIFBhZ2VzCiAgICAgICAgdXNlczogY2xvdWRmbGFyZS9w
YWdlcy1hY3Rpb25AdjEKICAgICAgICB3aXRoOgogICAgICAgICAgYXBpVG9rZW46ICR7eyBzZWNyZXRz
LkNGX0FQSV9UT0tFTiB9fQogICAgICAgICAgYWNjb3VudElkOiAkeysgc2VjcmV0cy5DRl9BQ0NPVU5U
X0lEICV9CiAgICAgICAgICBwcm9qZWN0TmFtZTogIjkxNnNsYWJzIgogICAgICAgICAgZGlyZWN0b3J5
OiAiX3NpdGUiCiAgICAgICAgICBnaXRIdWJUb2tlbjogJHtzZWNyZXRzLkdJVEhVQl9UT0tFTn0K
"@

    Write-FileFromBase64 "_layouts/default.html" $defaultLayout
    Write-FileFromBase64 "_layouts/page.html" $pageLayout
    Write-FileFromBase64 "_layouts/post.html" $postLayout

    Write-FileFromBase64 "_includes/head.html" $headInclude
    Write-FileFromBase64 "_includes/header.html" $headerInclude
    Write-FileFromBase64 "_includes/footer.html" $footerInclude

    Write-FileFromBase64 "_sass/base.scss" $baseScss
    Write-FileFromBase64 "_sass/layout.scss" $layoutScss
    Write-FileFromBase64 "_sass/components.scss" $componentsScss
    Write-FileFromBase64 "assets/css/main.scss" $mainScss

    Write-FileFromBase64 "assets/js/main.js" $mainJs

    Write-FileFromBase64 "_config.yml" $configYml
    Write-FileFromBase64 "index.md" $indexMd
    Write-FileFromBase64 "about.md" $aboutMd
    Write-FileFromBase64 "blog.md" $blogMd
    Write-FileFromBase64 "_posts/2026-05-23-welcome.md" $postSample

    Write-FileFromBase64 ".github/workflows/deploy.yml" $workflow

    Write-Host "== THEME + WORKFLOW INSTALLED =="
}

function Uninstall-Theme {
    Write-Host "== UNINSTALLING 916SLABS THEME =="

    $files = @(
        "_layouts/default.html",
        "_layouts/page.html",
        "_layouts/post.html",
        "_includes/head.html",
        "_includes/header.html",
        "_includes/footer.html",
        "_sass/base.scss",
        "_sass/layout.scss",
        "_sass/components.scss",
        "assets/css/main.scss",
        "assets/js/main.js",
        "_config.yml",
        "index.md",
        "about.md",
        "blog.md",
        "_posts/2026-05-23-welcome.md",
        ".github/workflows/deploy.yml"
    )

    foreach ($f in $files) {
        if (Test-Path $f) { Remove-Item $f -Force }
    }

    Write-Host "== THEME FILES REMOVED =="
}

function Run-Dev {
    Write-Host "== STARTING UNIFIED DEV (JEKYLL + WRANGLER) =="

    $jekyll = Start-Process powershell -ArgumentList "bundle exec jekyll serve --livereload" -PassThru
    $wrangler = Start-Process powershell -ArgumentList "npm run dev" -PassThru

    Write-Host "Jekyll PID: $($jekyll.Id)"
    Write-Host "Wrangler PID: $($wrangler.Id)"
    Write-Host "Press Enter to stop both..."
    [void][System.Console]::ReadLine()

    if (!$jekyll.HasExited) { $jekyll.Kill() }
    if (!$wrangler.HasExited) { $wrangler.Kill() }

    Write-Host "== DEV PROCESSES STOPPED =="
}

function Show-DeployInfo {
    Write-Host "== CLOUDFLARE AUTO DEPLOY HOOK =="
    Write-Host "GitHub Actions workflow written to .github/workflows/deploy.yml"
    Write-Host "Set secrets in GitHub:"
    Write-Host "  CF_API_TOKEN, CF_ACCOUNT_ID, GITHUB_TOKEN (default provided)"
}

switch ($mode) {
    "install"   { Install-Theme }
    "uninstall" { Uninstall-Theme }
    "dev"       { Run-Dev }
    "deploy"    { Show-DeployInfo }
}
