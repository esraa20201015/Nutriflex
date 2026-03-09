#!/bin/bash
#
# Nutriflex dev startup script (nutriflex-dev.sh)
#
# WHAT THIS SCRIPT DOES
# ---------------------
# - Installs Node.js dependencies for:
#     - nutriflex-backend  (NestJS API)
#     - nutriflex-frontend (React/Vite app)
# - Starts both dev servers (backend in background, frontend in foreground).
#     - Backend:  http://localhost:3000
#     - Frontend: http://localhost:5173
#
# REQUIREMENTS
# ------------
# - Node.js and npm installed (LTS version recommended).
# - Run from project root: the folder containing nutriflex-backend and nutriflex-frontend.
#
# HOW TO RUN
# ----------
# 1) Open Git Bash (Windows) or Terminal (Linux/Mac).
#
# 2) Go to project root:
#
#     cd "C:/Users/ShateeJumaira/OneDrive - meitstech.com/Desktop/UpDateNutriflex"
#
# 3) Make the script executable (first time only):
#
#     chmod +x nutriflex-dev.sh
#
# 4) Run the script:
#
#     ./nutriflex-dev.sh
#
#    - This runs npm install in backend and frontend (first time),
#      then starts backend in the background and frontend in the foreground.
#
# 5) To skip npm install on later runs:
#
#     SKIP_INSTALL=1 ./nutriflex-dev.sh
#
#    - Use when dependencies are already installed.
#

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "Nutriflex dev startup script"
echo "Root directory: $ROOT"
echo ""

if [ "${SKIP_INSTALL}" != "1" ]; then
  echo "Installing backend dependencies..."
  (cd nutriflex-backend && npm install)
  echo ""
  echo "Installing frontend dependencies..."
  (cd nutriflex-frontend && npm install)
  echo ""
fi

echo "Starting backend (NestJS) on http://localhost:3000 in background..."
(cd nutriflex-backend && npm run start:dev) &
BACKEND_PID=$!

echo "Starting frontend (Vite) on http://localhost:5173 ..."
echo "(Press Ctrl+C to stop both servers.)"
echo ""

# Run frontend in foreground; when it exits, kill backend
trap "kill $BACKEND_PID 2>/dev/null || true; exit" INT TERM
(cd nutriflex-frontend && npm run dev)
kill $BACKEND_PID 2>/dev/null || true
