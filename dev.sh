#!/usr/bin/env bash
# smbx.ai local dev stack — Express API (:3000) + Vite (:5173) in one command.
#
#   bash dev.sh        (or ./dev.sh after chmod +x)
#
# The API loads .env via server/loadEnv.ts, which backfills any present-but-empty
# ambient var (e.g. a shell profile exporting ANTHROPIC_API_KEY="") — so the AI
# key is picked up with no manual `source`. Ctrl+C stops both servers.

cd "$(dirname "$0")" || exit 1

echo "→ smbx.ai dev: freeing ports + starting API (:3000) and Vite (:5173)…"
for p in 3000 5173; do
  pid=$(lsof -ti tcp:"$p" 2>/dev/null)
  if [ -n "$pid" ]; then echo "  freeing :$p (pid $pid)"; kill "$pid" 2>/dev/null; fi
done
sleep 1

npm run dev:api &
API_PID=$!
trap 'echo; echo "→ stopping dev stack…"; kill "$API_PID" 2>/dev/null' EXIT INT TERM

sleep 1
echo "→ API starting (pid $API_PID). Launching Vite — open http://localhost:5173"
npm run dev
