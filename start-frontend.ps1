# Start Frontend Server
# Run this in PowerShell: .\start-frontend.ps1

Write-Host "Starting Skillsy Frontend..." -ForegroundColor Cyan

cd frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_SUPABASE_URL=https://zdmlbmktcmwuehnrlvtd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWxibWt0Y213dWVobnJsdnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTkwOTUsImV4cCI6MjA4MzQzNTA5NX0.p4g19hcuVKRJ5IAS6RAVBXHIY1SNQ_mnOuq7qmMyN9Q
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
"@ | Out-File -FilePath ".env.local" -Encoding utf8
}

Write-Host ""
Write-Host "🚀 Starting Next.js dev server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

cmd /c "npm run dev"
