#!/usr/bin/env bash
# Double-click me (or `open dev.command`) to launch the smbx.ai dev stack in
# Terminal. Delegates to dev.sh. macOS runs .command files in a Terminal window
# via LaunchServices — no Automation permission needed.
cd "$(dirname "$0")" || exit 1
exec bash ./dev.sh
