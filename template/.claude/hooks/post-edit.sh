#!/bin/sh
# PostToolUse hook for Edit|Write|MultiEdit.
# Lints + formats only the edited file. Silent on success, never blocks.

file=$(node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).tool_input?.file_path||"")}catch{}})')
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

bin="$CLAUDE_PROJECT_DIR/node_modules/.bin"
"$bin/oxlint" --fix --quiet --no-error-on-unmatched-pattern "$file" > /dev/null 2>&1
"$bin/oxfmt" --no-error-on-unmatched-pattern "$file" > /dev/null 2>&1
exit 0
