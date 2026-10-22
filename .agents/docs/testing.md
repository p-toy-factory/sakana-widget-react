# Testing

Tests use **Vitest** configured in `vitest.config.ts` with two test projects:

- **Node tests** (`src/**/*.test.{ts,tsx}`) — unit tests with `@testing-library/react` in happy-dom
- **Browser tests** (`src/**/*.browser.test.{ts,tsx}`) — integration tests with Playwright (`@vitest/browser-playwright`, Chromium, 300×300 viewport)

Both projects enable React StrictMode by default in their setup files:
`test/setup.node.ts` configures `@testing-library/react`, and
`test/setup.browser.ts` configures `vitest-browser-react`. Use these render helpers
for component and hook tests so initial renders and rerenders use StrictMode.

Keep both browser renderer entry points in `optimizeDeps.include`. Otherwise,
loading `/pure` from setup can trigger a dependency reload during test startup.

## Run all tests

```bash
pnpm run test
```

## Run a specific test file

```bash
pnpm run test src/hooks/use-structurally-stable-value.test.ts
```
