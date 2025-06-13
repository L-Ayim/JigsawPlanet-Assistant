# Start Jigsaw Planet Assistant
# This script verifies dependencies and launches the Electron GUI.

Write-Host "=== Jigsaw Planet Assistant Launcher ===" -ForegroundColor Cyan

function Install-Node {
    Write-Host "Node.js not found. Attempting installation..." -ForegroundColor Yellow
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Installing Node.js via winget" -ForegroundColor Yellow
        winget install -e --id OpenJS.NodeJS.LTS
    } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Installing Node.js via Chocolatey" -ForegroundColor Yellow
        choco install nodejs -y
    } else {
        Write-Host "No package manager available to auto-install Node.js." -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org and run this script again." -ForegroundColor Red
        exit 1
    }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Install-Node
} else {
    $ver = node --version
    Write-Host "Node.js $ver detected" -ForegroundColor Green
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm was not found even after installing Node.js." -ForegroundColor Red
    exit 1
}

Write-Host "Checking npm packages" -ForegroundColor Cyan
if (-not (Test-Path node_modules)) {
    Write-Host "node_modules directory missing - running npm install" -ForegroundColor Yellow
    npm install
} else {
    $npmStatus = npm ls --depth=0 2>&1
    if ($npmStatus -match "missing") {
        Write-Host "Some packages are missing - running npm install" -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "All packages are present" -ForegroundColor Green
    }
}

Write-Host "Launching Electron GUI" -ForegroundColor Cyan
npm start
