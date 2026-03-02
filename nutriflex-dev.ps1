<#
 Nutriflex dev startup script (nutriflex-dev.ps1)

 WHAT THIS SCRIPT DOES
 ---------------------
 - Installs Node.js dependencies for:
     - nutriflex-backend  (NestJS API)
     - nutriflex-frontend (React/Vite app)
 - Starts both dev servers in separate PowerShell windows:
     - Backend:  http://localhost:3000
     - Frontend: http://localhost:5173

 REQUIREMENTS
 ------------
 - Node.js and npm installed (LTS version recommended)
 - This file located at the project root:
     C:\Users\ShateeJumaira\OneDrive - meitstech.com\Desktop\UpDateNutriflex

 FIRST‑TIME POWERSHELL SETUP (once per machine)
 ----------------------------------------------
 If running scripts is blocked, open PowerShell **as Administrator** and run:

     Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

 HOW TO RUN
 ----------
 1) Open PowerShell.
 2) Navigate to the project root:

     cd "C:\Users\ShateeJumaira\OneDrive - meitstech.com\Desktop\UpDateNutriflex"

 3) Run the script:

     .\nutriflex-dev.ps1

    - This will run `npm install` in backend and frontend (first time),
      then open two new PowerShell windows for the dev servers.

 4) On later runs, you can skip `npm install` to save time:

     .\nutriflex-dev.ps1 -SkipInstall

    - Use this when dependencies are already installed.

 This script is designed so team members who do **not** know Node.js
 can still start the project with a single command, as long as Node.js
 is installed on the machine.
#>
Param(
    [switch]$SkipInstall
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Nutriflex dev startup script" -ForegroundColor Cyan
Write-Host "Root directory: $root"

if (-not $SkipInstall) {
    Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
    Push-Location "$root\nutriflex-backend"
    npm install
    Pop-Location

    Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
    Push-Location "$root\nutriflex-frontend"
    npm install
    Pop-Location
}

Write-Host "`nStarting backend (NestJS) on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "cd `"$root\nutriflex-backend`"; npm run start:dev"
)

Write-Host "Starting frontend (Vite) on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "cd `"$root\nutriflex-frontend`"; npm run dev"
)

Write-Host "`nDev servers starting in separate windows." -ForegroundColor Cyan
Write-Host "Tip: Re-run with -SkipInstall to skip npm install next time." -ForegroundColor DarkGray

