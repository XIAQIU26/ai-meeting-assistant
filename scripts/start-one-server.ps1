$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$runtimeRoot = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies"
$nodeBin = Join-Path $runtimeRoot "node\bin"
$pnpmBin = Join-Path $runtimeRoot "bin\fallback"

$env:Path = "$nodeBin;$pnpmBin;$env:Path"
Set-Location $projectRoot

Write-Host "Starting AI 科研组会管理助手 Demo..."
Write-Host "Open: http://127.0.0.1:4000"
Write-Host "Keep this PowerShell window open while using the website."

pnpm --filter backend start
