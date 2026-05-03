#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

let raw = ''
for await (const chunk of process.stdin) raw += chunk

let cmd = ''
try {
  cmd = JSON.parse(raw || '{}')?.tool_input?.command ?? ''
} catch {
  process.exit(0)
}

if (!/^\s*git\s+commit\b/.test(cmd)) process.exit(0)
if (/--no-verify\b/.test(cmd)) process.exit(0)

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const r = spawnSync('npx', ['--no', '--', 'tsc', '--noEmit'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] })

if (r.status === 0) process.exit(0)

const out = (r.stdout?.toString() || '') + (r.stderr?.toString() || '')
console.error(`typecheck failed — fix before committing\n\n${out}`)
process.exit(2)
