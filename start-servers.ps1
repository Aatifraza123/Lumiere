# Festo - Start Both Servers Script
# This script kills any existing processes on ports 5000 and 5173 before starting servers

Write-Host "`n=== Festo Servers Starting ===`n" -ForegroundColor Cyan

# Kill processes on port 5000
Write-Host "Checking port 5000..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid5000 = $port5000.OwningProcess
    Write-Host "Killing process on port 5000 (PID: $pid5000)..." -ForegroundColor Red
    Stop-Process -Id $pid5000 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Kill processes on port 5173
Write-Host "Checking port 5173..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    $pid5173 = $port5173.OwningProcess
    Write-Host "Killing process on port 5173 (PID: $pid5173)..." -ForegroundColor Red
    Stop-Process -Id $pid5173 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Kill all node processes (to be safe)
Write-Host "Cleaning up all node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "`nPorts cleared! Starting servers...`n" -ForegroundColor Green

# Start both servers using concurrently
Set-Location $PSScriptRoot
npx concurrently "npm run dev:backend" "npm run dev:frontend" --names "BACKEND,FRONTEND" --prefix-colors "blue,green"

