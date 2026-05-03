#!/bin/sh
# Stop hook: gates turn completion on lint + format being clean.
# Silent on success, exit 2 with errors on stderr to feed Claude on failure.

bin="$CLAUDE_PROJECT_DIR/node_modules/.bin"

out=$("$bin/oxlint" 2>&1) || { printf '%s\n' "$out" >&2; exit 2; }
out=$("$bin/oxfmt" --check 2>&1) || { printf '%s\n' "$out" >&2; exit 2; }
exit 0
