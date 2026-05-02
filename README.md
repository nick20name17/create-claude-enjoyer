# create-claude-enjoyer

Інтерактивний скаффолдер для проекту claude-enjoyer.

## Використання (після публікації)

```bash
bun create claude-enjoyer my-app
# або
npm create claude-enjoyer@latest my-app
```

## Локальне тестування (без публікації)

```bash
cd create-claude-enjoyer
bun install            # встановити @clack/prompts

# варіант 1: запустити напряму
node index.js test-app

# варіант 2: через npm link
npm link
bun create claude-enjoyer test-app    # десь в іншій папці

# варіант 3: bun підтримує локальні шляхи
bun create ./create-claude-enjoyer test-app
```

## Що питає

- Назва проекту
- Які MCP сервери підключити (генерує `.mcp.json`)
- Які скіли увімкнути (генерує `.claude/settings.json`)
- Package manager для `install`
- `git init` чи ні

## Як оновлювати template

Коли допиляєш `~/Desktop/claude-enjoyer/`, синхронізуй:

```bash
cd ~/Desktop/create-claude-enjoyer
bun run sync
```

Скрипт rsync'ає поточний стан проекту в `template/` (без `node_modules`,
`bun.lock`, `dist`).

## Як додати новий MCP / скіл

У `index.js`:

- розшир `MCP_REGISTRY` об'єктом `{ label, config }`
- додай рядок до `SKILLS`

## Публікація

```bash
npm publish --access public
```

Назва пакета **обов'язково** з префіксом `create-` — інакше `bun create` /
`npm create` його не знайдуть.

## Чому `_gitignore`

npm/bun не публікують файли з назвою `.gitignore` як частину пакета (їх
використовують для exclusion-логіки). Тому в `template/` лежить
`_gitignore`, а CLI перейменовує його в `.gitignore` після копії.
