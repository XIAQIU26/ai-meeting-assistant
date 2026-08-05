$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$runtimeRoot = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies"
$nodeBin = Join-Path $runtimeRoot "node\bin"
$pnpmBin = Join-Path $runtimeRoot "bin\fallback"

$env:Path = "$nodeBin;$pnpmBin;$env:Path"
Set-Location $projectRoot

Write-Host "Starting backend on http://127.0.0.1:4000"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-Command",
  "`$env:Path='$env:Path'; cd '$projectRoot'; pnpm --filter backend start"
)

Start-Sleep -Seconds 2

Write-Host "Starting frontend on http://127.0.0.1:5173"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-Command",
  "`$env:Path='$env:Path'; cd '$projectRoot'; pnpm --filter frontend dev"
)

Write-Host "Demo is launching. Open http://127.0.0.1:5173"
