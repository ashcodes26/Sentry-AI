#!/usr/bin/env bash
set -e

echo "==================================================="
echo "  SENTRY (PredictIQ) - One-Click Turnkey Launcher"
echo "==================================================="
echo ""

npx --yes concurrently -k -n "GATEWAY,ML-ENGINE" -c "cyan,magenta" "tsx server.ts" "node run_ml.cjs"
