# AGENTS.md

Instructions for AI coding agents working on this repository.

## Project Overview

A React component wrapper for [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget). The library exports `SakanaWidget` and `SakanaWidgetReact` (alias to avoid naming conflicts with the upstream `SakanaWidget` class) from `src/index.tsx`.

For upstream sakana-widget documentation, see `node_modules/sakana-widget/README.md`.

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Development (Storybook on port 6006)
pnpm run build        # Build library (outputs to dist/)
pnpm run test         # Run tests
pnpm run format:fix   # Format code
pnpm run lint:fix     # Lint code
```

## Code Style

- **Formatter**: Biome (`pnpm run format:fix`)
- **Linter**: ESLint with `eslint-config-pcp` (`pnpm run lint:fix`)
- **Indentation**: Tabs for source code (JS/TS/TSX use 2-space width); spaces for JSON/YAML (2-space)
- **Hook rule**: `useIsomorphicLayoutEffect` is registered as an additional hook in `react-hooks/exhaustive-deps`

## Testing

Two test projects run via Vitest (`pnpm run test`):

- **Node tests** (`src/**/*.test.{ts,tsx}`) — unit tests using `@testing-library/react-hooks`
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

The `skills/` directory is included in the npm package via the `files` field in
`package.json`. When updating the component API, keep `SKILL.md` in sync.

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
