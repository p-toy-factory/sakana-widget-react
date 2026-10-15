# Testing

Tests use **Vitest** configured in `vitest.config.ts` with two test projects:

- **Node tests** (`src/**/*.test.{ts,tsx}`) — unit tests with `@testing-library/react` in happy-dom; SSR tests use `@vitest-environment node` to verify imports and rendering without browser globals
- **Browser tests** (`src/**/*.browser.test.{ts,tsx}`) — integration tests with Playwright (`@vitest/browser-playwright`, Chromium, 300×300 viewport)

Both projects enable React StrictMode by default in their setup files:
`test/setup.node.ts` configures `@testing-library/react`, and
`test/setup.browser.ts` configures `vitest-browser-react`. Use these render helpers
for component and hook tests so initial renders and rerenders use StrictMode.

Keep both browser renderer entry points in `optimizeDeps.include`. Otherwise,
loading `/pure` from setup can trigger a dependency reload during test startup.

The Node project inlines `sakana-widget` through Vite so SSR tests can load its
CSS imports while using the real upstream module. The browser project prebundles
both character modules to avoid dependency discovery reloading tests.

## Run all tests

```bash
pnpm run test
```

## Run a specific test file

```bash
pnpm run test src/hooks/use-structurally-stable-value.test.ts
```

## Package and Source Navigation

1. Prepare a temporary repository copy without `dist/` and install its development dependencies.
2. Run `npm pack --foreground-scripts --pack-destination <archive-directory>` in that copy. The `prepack` hook builds the package.
3. Run `tar -tzf <tarball>` to inspect the archive. Check for declarations, declaration maps, source files, and hooks. Exclude tests and stories.
4. Install the tarball in a consumer project outside the repository. Use no workspace links or TypeScript path aliases.
5. Select the workspace TypeScript version in the editor. Use the same version as this repository.
6. Use Go to Definition on `SakanaWidget`, `SakanaWidgetReact`, `SakanaWidgetProps`, and `SakanaWidgetApi`. Each target must resolve to the installed package's `src/index.tsx` or `src/core.tsx`, as appropriate.
7. Check that relative source imports resolve to the installed hooks.
8. Run `pnpm run typecheck` and `pnpm run build --fail-on-warn` in the repository.

Record editor navigation separately. A successful build or pack does not prove that editor navigation works.
