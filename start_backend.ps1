# Helper script to start the backend from the project root
$ErrorActionPreference = "Stop"

Write-Host "Starting Insurenz Backend..." -ForegroundColor Cyan

# Check if we are in the root or already in backend
if (Test-Path "backend\backend\main.py") {
    cd backend\backend
} elseif (Test-Path "backend\main.py") {
    # Nested case
    cd backend
} elseif (-not (Test-Path "main.py")) {
    Write-Error "Could not find backend directory structure. Please run this from the project root."
}

# Activate venv if exists in root (relative to current position after cd? No, venv is in root)
# Let's use the absolute path to python in venv if possible, or assume it's in PATH if activated.
# But better to try to find the venv.

$venvPython = "..\..\venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    # Try local venv
    $venvPython = "..\venv\Scripts\python.exe"
    if (-not (Test-Path $venvPython)) {
         $venvPython = "python" # Hope it's in PATH
    }
}

Write-Host "Using Python: $venvPython" -ForegroundColor Gray

& $venvPython -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
