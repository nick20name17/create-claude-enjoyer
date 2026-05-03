In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## React Compiler

Project uses React Compiler (`vite.config.ts` → `reactCompilerPreset`). Don't suggest or add `useMemo`, `useCallback`, `React.memo` for perf — compiler memoizes automatically. Exception: when ref stability is needed for semantics (`useEffect` deps, `Map` keys, equality checks) — ok, but comment why.

## Types

`@total-typescript/ts-reset` enabled via `src/reset.d.ts`. `JSON.parse` and `fetch().json()` return `unknown` — validate with zod (preferred) or assert with `as` only at trusted boundaries. `[].filter(Boolean)` narrows out falsy.

## Plans

- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision.
