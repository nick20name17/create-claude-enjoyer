#!/usr/bin/env node
import {
  intro,
  outro,
  text,
  select,
  confirm,
  isCancel,
  cancel,
  spinner,
  note,
} from "@clack/prompts";
import { cp, readFile, writeFile, rename, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { spawn } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(here, "template");

const PMS = [
  { value: "bun", label: "bun" },
  { value: "pnpm", label: "pnpm" },
  { value: "npm", label: "npm" },
  { value: "skip", label: "skip install" },
];

const MCP_RUNNERS = {
  bun: { command: "bunx", prefix: [] },
  pnpm: { command: "pnpm", prefix: ["dlx"] },
  npm: { command: "npx", prefix: ["-y"] },
  skip: { command: "npx", prefix: ["-y"] },
};

const PM_DENY = {
  bun: ["Bash(npm:*)", "Bash(pnpm:*)", "Bash(yarn:*)"],
  pnpm: ["Bash(npm:*)", "Bash(bun:*)", "Bash(yarn:*)"],
  npm: ["Bash(pnpm:*)", "Bash(bun:*)", "Bash(yarn:*)"],
};

function checkCancel(value) {
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return value;
}

function mustReplace(content, search, replacement, label) {
  const next = content.replace(search, replacement);
  if (next === content) {
    throw new Error(`scaffolder: failed to apply edit "${label}" — pattern not found`);
  }
  return next;
}

async function run() {
  intro("create-claude-enjoyer");

  const argName = process.argv[2];
  const name = checkCancel(
    argName ??
      (await text({
        message: "Project name?",
        placeholder: "my-app",
        defaultValue: "my-app",
        validate: (v) => {
          if (!v) return undefined;
          if (!/^[a-z0-9][a-z0-9-_]*$/i.test(v))
            return "Only letters/digits/-/_";
        },
      })),
  );

  const target = resolve(process.cwd(), name);
  let shouldClean = false;

  if (existsSync(target)) {
    const overwrite = checkCancel(
      await confirm({
        message: `Folder "${name}" exists. Overwrite?`,
        initialValue: false,
      }),
    );
    if (!overwrite) {
      cancel("Folder already exists — cancelled.");
      process.exit(0);
    }
    shouldClean = true;
  }

  const chosenPm = checkCancel(
    await select({
      message: "Install dependencies?",
      options: PMS,
      initialValue: "bun",
    }),
  );

  const darkMode = checkCancel(
    await confirm({ message: "Dark mode support?", initialValue: true }),
  );

  const useVitest = checkCancel(
    await confirm({ message: "Vitest unit tests?", initialValue: false }),
  );

  const gitInit = checkCancel(
    await confirm({ message: "git init?", initialValue: true }),
  );

  const s = spinner();
  s.start("Copying template");
  if (shouldClean) await rm(target, { recursive: true, force: true });
  await cp(TEMPLATE, target, { recursive: true });
  // _gitignore -> .gitignore (npm doesn't publish .gitignore as-is)
  const ignoreSrc = join(target, "_gitignore");
  if (existsSync(ignoreSrc)) await rename(ignoreSrc, join(target, ".gitignore"));
  s.stop("Template copied");

  // package.json: set name
  const pkgPath = join(target, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    pkg.name = name;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // .mcp.json: rewrite command/args for the chosen package manager
  const mcpPath = join(target, ".mcp.json");
  if (existsSync(mcpPath)) {
    const mcp = JSON.parse(await readFile(mcpPath, "utf8"));
    const runner = MCP_RUNNERS[chosenPm];
    for (const server of Object.values(mcp.mcpServers ?? {})) {
      if (server.command !== "npx") continue;
      const tail = server.args?.[0] === "-y" ? server.args.slice(1) : server.args ?? [];
      server.command = runner.command;
      server.args = [...runner.prefix, ...tail];
    }
    await writeFile(mcpPath, JSON.stringify(mcp, null, 2) + "\n");
  }

  // .claude/settings.json: pin chosen package manager via permissions.deny
  if (chosenPm !== "skip") {
    const claudeDir = join(target, ".claude");
    await mkdir(claudeDir, { recursive: true });
    const settingsPath = join(claudeDir, "settings.json");
    const settings = existsSync(settingsPath)
      ? JSON.parse(await readFile(settingsPath, "utf8"))
      : {};
    settings.permissions = {
      ...(settings.permissions ?? {}),
      deny: PM_DENY[chosenPm],
    };
    await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n");
  }

  // No dark mode — drop ThemeProvider, .dark CSS block, FOUC script, force theme='light' in Sonner
  if (!darkMode) {
    await rm(join(target, "src/providers/theme.tsx"), { force: true });

    await writeFile(
      join(target, "src/providers/index.tsx"),
      `import type { PropsWithChildren } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider } from './auth'
import { ReactQueryProvider } from './react-query'

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthProvider>
    </ReactQueryProvider>
  )
}
`,
    );

    const sonnerPath = join(target, "src/components/ui/sonner.tsx");
    let sonner = await readFile(sonnerPath, "utf8");
    sonner = mustReplace(sonner, /\n\nimport \{ useTheme \} from '@\/providers\/theme'\n/, "\n", "sonner: useTheme import");
    sonner = mustReplace(sonner, /\n  const \{ theme = 'system' \} = useTheme\(\)\n\n/, "\n", "sonner: useTheme call");
    sonner = mustReplace(sonner, "theme={theme as ToasterProps['theme']}", "theme='light'", "sonner: theme prop");
    await writeFile(sonnerPath, sonner);

    const cssPath = join(target, "src/index.css");
    let css = await readFile(cssPath, "utf8");
    css = mustReplace(css, /\n\.dark \{[\s\S]*?\n\}\n/, "\n", "index.css: .dark block");
    await writeFile(cssPath, css);

    const indexHtmlPath = join(target, "index.html");
    let html = await readFile(indexHtmlPath, "utf8");
    html = mustReplace(
      html,
      /\n    <!-- @scaffolder:dark-mode-init -->[\s\S]*?<!-- \/@scaffolder:dark-mode-init -->\n/,
      "\n",
      "index.html: dark-mode-init block",
    );
    await writeFile(indexHtmlPath, html);
  }

  // No Vitest — drop dep, scripts, vite.config test block, and CI step
  if (!useVitest) {
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    delete pkg.scripts?.test;
    delete pkg.scripts?.["test:run"];
    delete pkg.devDependencies?.vitest;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    const viteConfigPath = join(target, "vite.config.ts");
    let viteCfg = await readFile(viteConfigPath, "utf8");
    viteCfg = mustReplace(viteCfg, "from 'vitest/config'", "from 'vite'", "vite.config: import source");
    viteCfg = mustReplace(
      viteCfg,
      ",\n  test: { include: ['src/**/*.test.ts'], passWithNoTests: true }",
      "",
      "vite.config: test block",
    );
    await writeFile(viteConfigPath, viteCfg);

    const ciPath = join(target, ".github/workflows/ci.yml");
    if (existsSync(ciPath)) {
      let ci = await readFile(ciPath, "utf8");
      ci = mustReplace(ci, "      - run: bun run test:run\n", "", "ci.yml: test:run step");
      await writeFile(ciPath, ci);
    }
  }

  // No git init — drop `prepare` (otherwise simple-git-hooks fails during install)
  if (!gitInit && existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    if (pkg.scripts?.prepare === "simple-git-hooks") {
      delete pkg.scripts.prepare;
      await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    }
  }

  if (gitInit) {
    await execIn(target, "git", ["init", "-q"]);
  }

  if (chosenPm !== "skip") {
    s.start(`${chosenPm} install`);
    try {
      await execIn(target, chosenPm, ["install"]);
      s.stop(`${chosenPm} install — done`);
    } catch {
      s.stop(`${chosenPm} install failed — run it manually`);
    }
  }

  note(`📁 ${target}`, "Done");

  const runner = MCP_RUNNERS[chosenPm];
  const skillCmd = [runner.command, ...runner.prefix, "skills", "add", "shadcn/ui"].join(" ");
  note(`shadcn skill (optional, for Claude Code):\n  cd ${name} && ${skillCmd}`, "AI context");

  outro(
    chosenPm === "skip"
      ? `cd ${name} && bun install && bun dev`
      : `cd ${name} && ${chosenPm} run dev`,
  );
}

function execIn(cwd, cmd, args) {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, { cwd, stdio: "ignore" });
    child.on("error", rej);
    child.on("exit", (code) =>
      code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`)),
    );
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
