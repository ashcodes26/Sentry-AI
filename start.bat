@echo off
echo ===================================================
echo   SENTRY (PredictIQ) - One-Click Turnkey Launcher
echo ===================================================
echo.

echo [1/2] Verifying Python and Node runtimes...
cmd /c npx --yes concurrently -k -n "GATEWAY,ML-ENGINE" -c "cyan,magenta" "tsx server.ts" "node run_ml.cjs"
pause
