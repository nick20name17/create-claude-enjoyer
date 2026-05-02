#!/usr/bin/env node
import {
  intro,
  outro,
  text,
  multiselect,
  confirm,
  isCancel,
  cancel,
  spinner,
  note,
} from "@clack/prompts";
import { cp, readFile, writeFile, mkdir, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { spawn } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(here, "template");

const MCP_REGISTRY = {
  filesystem: {
    label: "filesystem — доступ до локальних файлів",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
    },
  },
  github: {
    label: "github — issues, PR, репозиторії",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "" },
    },
  },
  postgres: {
    label: "postgres — SQL запити",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "postgres://localhost/db"],
    },
  },
  brave: {
    label: "brave-search — пошук в інтернеті",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: { BRAVE_API_KEY: "" },
    },
  },
};

const SKILLS = [
  { value: "code-review", label: "code-review" },
  { value: "security-review", label: "security-review" },
  { value: "simplify", label: "simplify" },
  { value: "react-doctor", label: "react-doctor" },
  { value: "frontend-design", label: "frontend-design" },
];

const PMS = [
  { value: "bun", label: "bun" },
  { value: "pnpm", label: "pnpm" },
  { value: "npm", label: "npm" },
  { value: "skip", label: "не встановлювати" },
];

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
  }

  const mcps = checkCancel(
    await multiselect({
      message: "MCP сервери (Space — вибрати, Enter — далі)",
      options: Object.entries(MCP_REGISTRY).map(([value, { label }]) => ({
        value,
        label,
      })),
      required: false,
    }),
  );

  const skills = checkCancel(
    await multiselect({
      message: "Скіли Claude Code",
      options: SKILLS,
      required: false,
    }),
  );

  const pm = checkCancel(
    await multiselect({
      message: "Встановити залежності? (вибери один)",
      options: PMS,
      required: false,
      initialValues: ["bun"],
    }),
  );
  const chosenPm = Array.isArray(pm) ? pm[0] ?? "skip" : "skip";

  const gitInit = checkCancel(
    await confirm({ message: "git init?", initialValue: true }),
  );

  const s = spinner();
  s.start("Копіюю шаблон");
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

  // .mcp.json
  if (mcps.length) {
    const mcpServers = Object.fromEntries(
      mcps.map((k) => [k, MCP_REGISTRY[k].config]),
    );
    await writeFile(
      join(target, ".mcp.json"),
      JSON.stringify({ mcpServers }, null, 2) + "\n",
    );
  }

  // .claude/settings.json
  if (skills.length) {
    await mkdir(join(target, ".claude"), { recursive: true });
    await writeFile(
      join(target, ".claude", "settings.json"),
      JSON.stringify({ enabledSkills: skills }, null, 2) + "\n",
    );
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

  const summary = [
    `📁 ${target}`,
    mcps.length ? `🔌 MCP: ${mcps.join(", ")}` : null,
    skills.length ? `🎯 Skills: ${skills.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  note(summary, "Готово");

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
