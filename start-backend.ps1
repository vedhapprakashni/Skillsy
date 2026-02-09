# Start Backend Server
# Run this in PowerShell: .\start-backend.ps1

Write-Host "Starting Skillsy Backend..." -ForegroundColor Cyan

cd backend

# Activate virtual environment
if (Test-Path "venv\Scripts\Activate.ps1") {
    .\venv\Scripts\Activate.ps1
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\Activate.ps1
}

# Install dependencies if needed
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    @"
SUPABASE_URL=https://zdmlbmktcmwuehnrlvtd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWxibWt0Y213dWVobnJsdnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTkwOTUsImV4cCI6MjA4MzQzNTA5NX0.p4g19hcuVKRJ5IAS6RAVBXHIY1SNQ_mnOuq7qmMyN9Q
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
"@ | Out-File -FilePath ".env" -Encoding utf8
}

Write-Host ""
Write-Host "🚀 Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

uvicorn main:app --reload
