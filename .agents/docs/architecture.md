# Architecture

The library exports `SakanaWidget` and `SakanaWidgetReact` (alias to avoid naming conflicts with the upstream `SakanaWidget` class) from `src/index.tsx` and `src/core.tsx`. The default entry uses the upstream default entry, which registers both built-in characters; the core entry uses `sakana-widget/core` and registers none. Both load upstream CSS with the upstream module after mounting in the browser. Each entry defines its own React component and public types, sharing lifecycle behavior through `useSakanaWidget`, to wrap the vanilla JS [SakanaWidget](https://github.com/dsrkafuu/sakana-widget) class.

## Key Design Decisions

### DOM Delegation

The component does not manage widget DOM via React reconciliation. It creates a container `<div>` and lets the vanilla SakanaWidget class handle its own DOM, with manual cleanup on unmount. The lifecycle hook replaces the container content with an internal `<div>` and mounts upstream into that element. Cleanup calls upstream unmount only while the instance is still mounted, because the upstream close control can already have unmounted it.

### Client Loading and Upstream Types

Upstream v4's default entry reads `window` while registering its built-in characters during module evaluation. A static runtime import would therefore break server imports even if construction were inside an effect. Both React entries use type-only upstream imports at module scope and dynamic runtime imports inside the mount effect. Effects cancel pending initialization on cleanup; failed loads are surfaced through React error boundaries. Server rendering does not create a widget.

The upstream default and core entries publish separate class declarations with private members, which TypeScript treats as incompatible. The shared lifecycle hook accepts a minimal lifecycle contract. Each public entry defines its own component and exports its own concrete `SakanaWidgetApi` and `SakanaWidgetProps` types.

### Structural Memoization

Uses the `useStructurallyStableValue` hook with `dequal` for deep equality comparison. This prevents unnecessary widget re-instantiation when options objects are structurally equal but referentially different.

### Custom Hooks (`src/hooks/`)

- `use-sakana-widget.ts` — Shares asynchronous upstream loading, mounting, and cleanup between entries
- `use-structurally-stable-value.ts` — Memoizes values based on structural (deep) equality
- `use-merge-refs.ts` — Combines multiple refs into a single callback ref
- `use-isomorphic-layout-effect.ts` — SSR-safe `useLayoutEffect` (falls back to `useEffect` on the server)

### Ref Forwarding

The component exposes:

- `ref` — the container `<div>` element
- `widgetRef` prop — a public `SakanaWidgetApi` for programmatic control

`SakanaWidgetApi` is the upstream `SakanaWidget` type with `mount` and `unmount`
omitted. The runtime ref value is still the original upstream instance, but React owns
the widget lifecycle and the public TypeScript handle points consumers toward runtime
controls such as `setState`, `setCharacter`, `nextCharacter`, `triggerAutoMode`, `addControl`, and `removeControl`.

`widgetRef` is populated asynchronously after the module loads and the instance mounts. A stable callback `widgetRef` can configure each instance and return cleanup. Ref changes alone do not recreate the instance or rerun configuration; updating an object ref does not schedule React effects.

### Initial Motion

`disableBounceOnMount` sets the initial state to the v4 equilibrium for the configured `rotate` value, including zero velocities. Options changes and changes to this prop recreate the instance.
