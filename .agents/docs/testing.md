# Testing

Tests use **Vitest** configured in `vitest.config.ts` with two test projects:

- **Node tests** (`src/**/*.test.{ts,tsx}`) — unit tests with `@testing-library/react-hooks`
- **Browser tests** (`src/**/*.browser.test.{ts,tsx}`) — integration tests with Playwright (`@vitest/browser-playwright`, Chromium, 300×300 viewport)

## Run all tests

```bash
pnpm run test
```

## Run a specific test file

```bash
pnpm run test src/hooks/use-structurally-stable-value.test.ts
```
