# Copilot Agent Instructions — mana

> **Trust these instructions first.** Only search the repo if information here is incomplete or found to be incorrect.

## Project Summary

**mana** is a TypeScript project (Node.js). It is a small, newly scaffolded repository with a `src/` layout that compiles to `dist/`. There is no framework; it is a general-purpose TypeScript library/application.

- **Language:** TypeScript 5.x (strict mode)
- **Runtime:** Node.js (ES2020 target)
- **Module system:** ESNext with `bundler` module resolution
- **Package manager:** npm

## Development Philosophy — TDD (MANDATORY)

**All development MUST follow Test-Driven Development (TDD).**

1. **Red** — Write a failing test first.
2. **Green** — Write the minimal production code to make the test pass.
3. **Refactor** — Clean up while keeping tests green.

Never write production code without a failing test that requires it. Run tests frequently.

### Test Framework

The project does not yet have a test runner installed. Before writing any tests:

```bash
npm install --save-dev vitest
```

Then tests can be run with:

```bash
npx vitest run
```

Place test files alongside source files using the pattern `src/**/*.test.ts` or in a `tests/` directory. Vitest works out of the box with TypeScript and ESNext modules — no extra config is needed for this project.

## Build & Development Commands

Always run `npm install` first after cloning or when `package.json` changes.

| Task | Command | Notes |
|---|---|---|
| **Install deps** | `npm install` | Always run first. Required before build or test. |
| **Build** | `npm run build` | Runs `tsc`. Output goes to `dist/`. |
| **Watch mode** | `npm run dev` | Runs `tsc --watch`. |
| **Run** | `npm start` | Runs `node dist/index.js`. Must build first. |
| **Test** | `npx vitest run` | Requires vitest installed (see above). |
| **Type check only** | `npx tsc --noEmit` | Fast type-checking without emitting files. |

### Command Order

1. `npm install`
2. `npm run build` (must succeed before `npm start`)
3. `npx vitest run` (for tests)

### Known Constraints

- **Always build before running.** `npm start` executes compiled JS from `dist/`, so `npm run build` must succeed first.
- **Strict TypeScript.** `tsconfig.json` has `"strict": true`. All code must be properly typed — no implicit `any`, null safety required, etc.
- **No linter configured yet.** If you add ESLint, install `eslint` and `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`.

## Project Layout

```
mana/
├── .github/
│   └── copilot-instructions.md   # This file
├── src/
│   └── index.ts                  # Main entry point
├── dist/                         # Compiled output (git-ignored)
├── node_modules/                 # Dependencies (git-ignored)
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Key Files

| File | Purpose |
|---|---|
| `src/index.ts` | Application entry point. Exports `main()`. |
| `tsconfig.json` | TypeScript config. Source in `src/`, output in `dist/`. Strict mode. ES2020. |
| `package.json` | Project metadata, scripts, dependencies. |
| `.gitignore` | Ignores `node_modules/`, `dist/`, `*.js.map`, `*.d.ts.map`. |

### Architecture Notes

- Source lives in `src/`. The `rootDir` is `src/` and `outDir` is `dist/`.
- The project emits declarations (`.d.ts`) and source maps.
- Module resolution is set to `bundler` — use standard ESM import syntax (`import { x } from "./module.js"` or without extension for bundler resolution).

## CI / Validation

No GitHub Actions workflows or CI pipelines are configured yet. When adding a workflow:

1. Place it in `.github/workflows/`.
2. A minimal CI should run: `npm ci`, `npm run build`, `npx vitest run`.
3. Use Node.js 20+ in the workflow matrix.

## Validation Checklist

Before considering any change complete, verify:

- [ ] `npm run build` succeeds with zero errors
- [ ] `npx tsc --noEmit` passes (type check)
- [ ] `npx vitest run` passes all tests
- [ ] No new `any` types introduced (strict mode)
- [ ] New code has corresponding test files
