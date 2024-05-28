# Architecture

The library exports `SakanaWidget` and `SakanaWidgetReact` (alias to avoid naming conflicts with the upstream `SakanaWidget` class) from `src/index.tsx`. Both refer to the same React component that wraps the vanilla JS [SakanaWidget](https://github.com/dsrkafuu/sakana-widget) class.

## Key Design Decisions

### DOM Delegation

The component does not manage widget DOM via React reconciliation. It creates a container `<div>` and lets the vanilla SakanaWidget class handle its own DOM, with manual cleanup on unmount.

### Structural Memoization

Uses the `useStructurallyStableValue` hook with `dequal` for deep equality comparison. This prevents unnecessary widget re-instantiation when options objects are structurally equal but referentially different.

### Custom Hooks (`src/hooks/`)

- `use-structurally-stable-value.ts` — Memoizes values based on structural (deep) equality
- `use-merge-refs.ts` — Combines multiple refs into a single callback ref
- `use-isomorphic-layout-effect.ts` — SSR-safe `useLayoutEffect` (falls back to `useEffect` on the server)

### Ref Forwarding

The component exposes:

- `ref` — the container `<div>` element
- `widgetRef` prop — the SakanaWidget instance, for external programmatic control
