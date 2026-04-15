$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Nova JARVIS demo launcher starting..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$venvDir = Join-Path $backendDir "venv"
$venvPython = Join-Path $venvDir "Scripts\\python.exe"
$requirementsFile = Join-Path $backendDir "requirements.txt"
$backendApp = Join-Path $backendDir "app.py"

function Get-PythonCommand {
    if (Get-Command python3.12 -ErrorAction SilentlyContinue) {
        return "python3.12"
    }

    if (Get-Command python -ErrorAction SilentlyContinue) {
        return "python"
    }

    throw "Python was not found. Install Python 3 first, then run the script again."
}

if (-not (Test-Path $venvPython)) {
    $pythonCommand = Get-PythonCommand
    Write-Host "Creating backend virtual environment..." -ForegroundColor Yellow
    & $pythonCommand -m venv $venvDir
}

Write-Host "Installing backend requirements..." -ForegroundColor Yellow
& $venvPython -m pip install -r $requirementsFile

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host "Installing frontend packages..." -ForegroundColor Yellow
    Push-Location $frontendDir
    npm install
    Pop-Location
}

$backendCommand = "& '$venvPython' '$backendApp'"

Write-Host "Starting Flask backend in a new PowerShell window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    $backendCommand
)

Start-Sleep -Seconds 2

Write-Host "Starting React frontend in this window..." -ForegroundColor Yellow
Push-Location $frontendDir
npm run dev
Pop-Location
