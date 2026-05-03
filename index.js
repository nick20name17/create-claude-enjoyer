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
  { value: "skip", label: "не встановлювати" },
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
    cancel("Скасовано.");
    process.exit(0);
  }
  return value;
}

async function run() {
  intro("create-claude-enjoyer");

  const argName = process.argv[2];
  const name = checkCancel(
    argName ??
      (await text({
        message: "Назва проекту?",
        placeholder: "my-app",
        defaultValue: "my-app",
        validate: (v) => {
          if (!v) return undefined;
          if (!/^[a-z0-9][a-z0-9-_]*$/i.test(v))
            return "Тільки літери/цифри/-/_";
        },
      })),
  );

  const target = resolve(process.cwd(), name);
  let shouldClean = false;

  if (existsSync(target)) {
    const overwrite = checkCancel(
      await confirm({
        message: `Папка "${name}" існує. Перезаписати?`,
        initialValue: false,
      }),
    );
    if (!overwrite) {
      cancel("Папка вже існує — скасовано.");
      process.exit(0);
    }
    shouldClean = true;
  }

  const chosenPm = checkCancel(
    await select({
      message: "Встановити залежності?",
      options: PMS,
      initialValue: "bun",
    }),
  );

  const darkMode = checkCancel(
    await confirm({ message: "Підтримка темної теми?", initialValue: true }),
  );

  const gitInit = checkCancel(
    await confirm({ message: "git init?", initialValue: true }),
  );

  const s = spinner();
  s.start("Копіюю шаблон");
  if (shouldClean) await rm(target, { recursive: true, force: true });
  await cp(TEMPLATE, target, { recursive: true });
  // _gitignore -> .gitignore (npm не публікує .gitignore as-is)
  const ignoreSrc = join(target, "_gitignore");
  if (existsSync(ignoreSrc)) await rename(ignoreSrc, join(target, ".gitignore"));
  s.stop("Шаблон скопійовано");

  // package.json: підставити назву
  const pkgPath = join(target, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    pkg.name = name;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // .mcp.json: переписати command/args під обраний package manager
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

  // .claude/settings.json + CLAUDE.md: форсимо обраний package manager
  if (chosenPm !== "skip") {
    const claudeDir = join(target, ".claude");
    await mkdir(claudeDir, { recursive: true });
    const settings = {
      permissions: { deny: PM_DENY[chosenPm] },
    };
    await writeFile(
      join(claudeDir, "settings.json"),
      JSON.stringify(settings, null, 2) + "\n",
    );

    const claudeMdPath = join(target, "CLAUDE.md");
    if (existsSync(claudeMdPath)) {
      const md = await readFile(claudeMdPath, "utf8");
      const block = `\n## Package manager\n\n${chosenPm} only. don't use other PMs.\n`;
      if (!md.includes("## Package manager")) {
        await writeFile(claudeMdPath, md + block);
      }
    }
  }

  // Без темної теми — викидаємо ThemeProvider, .dark блок CSS, форсимо theme='light' у Sonner
  if (!darkMode) {
    await rm(join(target, "src/providers/theme.tsx"), { force: true });

    await writeFile(
      join(target, "src/providers/index.tsx"),
      `import type { PropsWithChildren } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { ReactQueryProvider } from './react-query'

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ReactQueryProvider>
  )
}
`,
    );

    const sonnerPath = join(target, "src/components/ui/sonner.tsx");
    let sonner = await readFile(sonnerPath, "utf8");
    sonner = sonner
      .replace(/\n\nimport \{ useTheme \} from '@\/providers\/theme'\n/, "\n")
      .replace(/\n  const \{ theme = 'system' \} = useTheme\(\)\n\n/, "\n")
      .replace("theme={theme as ToasterProps['theme']}", "theme='light'");
    await writeFile(sonnerPath, sonner);

    const cssPath = join(target, "src/index.css");
    let css = await readFile(cssPath, "utf8");
    css = css.replace(/\n\.dark \{[\s\S]*?\n\}\n/, "\n");
    await writeFile(cssPath, css);
  }

  // Якщо git init не зробили — приберемо `prepare` (інакше simple-git-hooks впаде під час install)
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
      s.stop(`${chosenPm} install — готово`);
    } catch {
      s.stop(`${chosenPm} install не вдалося — запусти вручну`);
    }
  }

  note(`📁 ${target}`, "Готово");

  const runner = MCP_RUNNERS[chosenPm];
  const skillCmd = [runner.command, ...runner.prefix, "skills", "add", "shadcn/ui"].join(" ");
  note(`shadcn skill (опційно, для Claude Code):\n  cd ${name} && ${skillCmd}`, "AI context");

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
