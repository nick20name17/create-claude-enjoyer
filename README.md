# create-claude-enjoyer

Interactive scaffolder for the claude-enjoyer project.

## Usage (after publishing)

```bash
bun create claude-enjoyer my-app
# or
npm create claude-enjoyer@latest my-app
```

## Local testing (without publishing)

```bash
cd create-claude-enjoyer
bun install            # install @clack/prompts

# option 1: run directly
node index.js test-app

# option 2: via npm link
npm link
bun create claude-enjoyer test-app    # somewhere in another folder

# option 3: bun supports local paths
bun create ./create-claude-enjoyer test-app
```

## What it asks

- Project name
- Which MCP servers to wire up (generates `.mcp.json`)
- Which skills to enable (generates `.claude/settings.json`)
- Package manager for `install`
- `git init` or not

## Updating the template

When you tweak `~/Desktop/claude-enjoyer/`, sync it:

```bash
cd ~/Desktop/create-claude-enjoyer
bun run sync
```

The script rsyncs the current project state into `template/` (excluding
`node_modules`, `bun.lock`, `dist`).

## Adding a new MCP / skill

In `index.js`:

- extend `MCP_REGISTRY` with a `{ label, config }` object
- add a line to `SKILLS`

## Publishing

```bash
npm publish --access public
```

The package name **must** start with `create-` — otherwise `bun create` /
`npm create` won't find it.

## Why `_gitignore`

npm/bun don't publish files named `.gitignore` as part of the package (they
use them for exclusion logic). So `template/` ships `_gitignore`, and the CLI
renames it to `.gitignore` after copying.
