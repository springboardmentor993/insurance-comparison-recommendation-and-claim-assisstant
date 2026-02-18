# PowerShell script to start all required services for Claims workflow
# Run this script from the project root directory OR backend/backend

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Insurenz Claims Services..." -ForegroundColor Cyan
Write-Host ""

# --- 1. Robust Directory Check ---
$currentDir = Get-Location
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath

# Determine Root Dir (Assuming script is in Root or we can find it)
# actually, if we run it from backend\backend, we need to know where root is.
# If script is in root, then $scriptDir IS root.
$rootDir = $scriptDir

Write-Host "📂 Working Directory: $currentDir" -ForegroundColor Gray
Write-Host "📂 Script Directory: $scriptDir" -ForegroundColor Gray

# Check if we are in backend\backend or root
$inBackend = $false
if (Test-Path "$currentDir\main.py") {
    $inBackend = $true
    Write-Host "ℹ️  Detected execution from backend directory." -ForegroundColor Cyan
} elseif (Test-Path "$currentDir\backend\backend\main.py") {
    $inBackend = $false
    Write-Host "ℹ️  Detected execution from root directory." -ForegroundColor Cyan
} else {
    # Try to guess
    if ($currentDir.Path.EndsWith("backend\backend")) {
        $inBackend = $true
    }
}

# --- 2. Find Python with Uvicorn ---
function Get-PythonPath {
    param ($Root)
    
    $candidates = @(
        "$Root\venv\Scripts\python.exe",
        "$Root\.venv\Scripts\python.exe",
        "$Root\backend\backend\venv\Scripts\python.exe",
        "$Root\..\..\venv\Scripts\python.exe",  # Relative from backend
        "$Root\..\..\.venv\Scripts\python.exe"
    )

    foreach ($p in $candidates) {
        if (Test-Path $p) {
            # Normalize path
            return (Resolve-Path $p).Path
        }
    }
    
    return "python" # Fallback to system python
}

# If we are in backend\backend, root is up two levels
if ($inBackend) {
   $possibleRoot = (Resolve-Path "..\..").Path
} else {
   $possibleRoot = $rootDir
}

$pythonPath = Get-PythonPath -Root $possibleRoot
Write-Host "🐍 Using Python: $pythonPath" -ForegroundColor Green

# Verify Uvicorn
try {
    & $pythonPath -c "import uvicorn; print('✅ Uvicorn found')"
} catch {
    Write-Warning "⚠️  Uvicorn not found in $pythonPath. Installing..."
    & $pythonPath -m pip install uvicorn fastapi celery redis python-multipart
}


# --- 3. Check Redis ---
Write-Host "📊 Checking Redis..." -ForegroundColor Yellow
$redisRunning = Get-Process redis-server -ErrorAction SilentlyContinue
if ($redisRunning) {
    Write-Host "✅ Redis is already running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis is not running (checked for 'redis-server' process)." -ForegroundColor Yellow
    Write-Host "   If you are using WSL or a remote Redis, you can ignore this." -ForegroundColor Gray
}

# --- 4. Install Deps (if needed) ---
Write-Host ""
Write-Host "📦 Ensuring Dependencies..." -ForegroundColor Yellow
if (-not $inBackend) {
    Set-Location backend\backend
}
& $pythonPath -m pip install -r requirements.txt | Out-Null
Write-Host "✅ Dependencies checked." -ForegroundColor Green

# --- 5. Database Setup ---
Write-Host ""
Write-Host "🗄️  Initializing Database Tables..." -ForegroundColor Yellow
& $pythonPath create_claims_tables.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tables checked/created." -ForegroundColor Green
} else {
    Write-Error "Failed to create tables."
}

# --- 6. Output Start Commands ---
Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the services, open separate terminal windows and run:" -ForegroundColor Cyan
Write-Host ""

# Construct paths relative to where the user IS
if ($inBackend) {
    $cdBackendCmd = "# Already in backend"
    $cdRootCmd = "cd ..\.."
    $cdFrontendCmd = "cd ..\..\frontend\insurance"
} else {
    $cdBackendCmd = "cd backend\backend"
    $cdRootCmd = "# Already in root"
    $cdFrontendCmd = "cd frontend\insurance"
}

Write-Host "Terminal 1 - Backend API:" -ForegroundColor Yellow
Write-Host "  $cdBackendCmd" -ForegroundColor Gray
Write-Host "  $pythonPath run.py" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 2 - Celery Worker:" -ForegroundColor Yellow
Write-Host "  $cdBackendCmd" -ForegroundColor Gray
Write-Host "  $pythonPath -m celery -A celery_app worker --loglevel=info --pool=solo" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 3 - Frontend:" -ForegroundColor Yellow
Write-Host "  $cdFrontendCmd" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
