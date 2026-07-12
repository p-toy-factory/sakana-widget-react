# AGENTS.md

Instructions for AI coding agents working on this repository.

## Project Overview

A React component wrapper for [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget). The library exports `SakanaWidget` and `SakanaWidgetReact` (alias to avoid naming conflicts with the upstream `SakanaWidget` class) from `src/index.tsx`.

For upstream sakana-widget documentation, see `node_modules/sakana-widget/README.md`.

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Development (Storybook on port 6006)
pnpm run build        # Build library (outputs to dist/ with declaration maps)
pnpm run build-storybook # Build the Storybook static site
pnpm run test         # Run tests
pnpm run test:browser # Run browser tests with Playwright
pnpm run fmt          # Format code
pnpm run fmt:check    # Check formatting
pnpm run lint         # Lint code
pnpm run lint:fix     # Lint code
pnpm run typecheck    # Type-check without emitting files
pnpm run storybook    # Start Storybook on port 6006
```

## Code Style

- **Formatter**: Oxfmt (`pnpm run fmt`)
- **Linter**: Oxlint (`pnpm run lint:fix`)
- **Indentation**: Tabs for source code (JS/TS/TSX use 2-space width); spaces for JSON/YAML (2-space)
  - `useIsomorphicLayoutEffect` is still the repo's custom layout-effect hook, but linting no longer depends on ESLint-specific hook configuration

## Testing

Two test projects run via Vitest (`pnpm run test`):

- **Node tests** (`src/**/*.test.{ts,tsx}`) — unit tests using `@testing-library/react` and happy-dom
- **Browser tests** (`src/**/*.browser.test.{ts,tsx}`) — integration tests using Playwright via `@vitest/browser-playwright`

Run a specific test file:

```bash
pnpm run test src/hooks/use-structurally-stable-value.test.ts
```

## Detailed Documentation

The following docs in `.agents/docs/` can be loaded on demand:

- [Architecture & Design Decisions](.agents/docs/architecture.md)
- [Git Commit Convention](.agents/docs/git-commit-convention.md) — full examples and details
- [Testing](.agents/docs/testing.md)
- [Tooling](.agents/docs/tooling.md)

## Project Documentation

- [README.md](README.md) — User-facing documentation (install, usage, API)

The `docs/` directory contains project-level documentation:

- `docs/api/DECISIONS.md` — API design decisions and rationale

## Agent Skills (npm)

This package ships an [Agent Skill](https://agentskills.io) following the
[npm-based Agent Skills convention](https://github.com/antfu/skills-npm/blob/main/PROPOSAL.md).

- `skills/sakana-widget-react/SKILL.md` — Usage skill for the SakanaWidget
  React component

The npm package publishes `dist/`, `skills/`, and the minimal `src/` TypeScript
sources needed by declaration maps so IDEs can jump from `dist/*.d.ts` back to
package-local sources. Those `src/*` paths are shipped for tooling support only
and are not part of the public import surface. When updating the component API,
keep `SKILL.md` in sync and ensure the published source-file allowlist still
matches the declaration-map closure.

## Maintenance

When code changes cause descriptions in this file (commands, directory structure,
conventions, etc.) to become inaccurate, update AGENTS.md and the relevant files
in `.agents/docs/` to stay consistent.

When you discover something that required multiple attempts or trial-and-error to
figure out, add it here or to the appropriate `.agents/docs/` file. Only record
things another agent couldn't discover by reading existing code, config files, or
documentation — e.g. commands that must run in a specific non-obvious order,
environment quirks that cause silent failures, or workarounds for undocumented
behavior.
