# Architecture

The library exports `SakanaWidget` and `SakanaWidgetReact` (alias to avoid naming conflicts with the upstream `SakanaWidget` class) from `src/index.tsx` to wrap the vanilla JS [SakanaWidget](https://github.com/dsrkafuu/sakana-widget) class. The default entry wraps the core component and registers both built-in characters through a module-level once-only initializer. The `sakana-widget-react/core` entry exports the same component aliases with an optional initializer for custom registration. Both entries import upstream CSS automatically.

## Key Design Decisions

### React Client Boundary

The package exports `dist/index.js` and `dist/core.js` as JavaScript entries. The
tsdown JavaScript banner emits `"use client";` at the start of each output bundle,
so both published entries declare their client boundary after bundling. Keep this
in the build configuration rather than relying on source directives surviving
bundling. Source files are shipped for declaration maps only, not as import
entry points. Revisit this setup if server-compatible exports are added.

### DOM Delegation

The component does not manage widget DOM via React reconciliation. It creates a container `<div>` and lets the vanilla SakanaWidget class handle its own DOM, with manual cleanup on unmount. Before creating an instance, the component clears the stable React host and mounts upstream directly into it. Upstream v4 appends its widget node; adding an intermediate container breaks `autoFit` sizing. Cleanup runs the callback ref cleanup, or clears the ref, then calls upstream unmount if the widget is still mounted.

### Core Entry and Client Initialization

The core component statically imports `sakana-widget/core`. Unlike the upstream
default entry, this entry does not register built-in characters during module
evaluation. All custom character registration uses this upstream core class.

The core `SakanaWidgetProps` includes
`initializer?: (Widget: typeof import("sakana-widget/core").default) => void`.
The client `useIsomorphicLayoutEffect` runs initializer, construction, and mounting
synchronously in that order. An initializer may run on each instance creation,
including Strict Mode remounts, so callers must make it safe to repeat and keep its
identity stable. Changes to the initializer recreate the instance.

The default wrapper omits `initializer` from its public props and passes a stable,
module-level once-only initializer that registers `chisato` and `takina`. This
avoids re-registering built-in characters when another default component mounts.
Server rendering does not create a widget or run an initializer. CSS is imported
statically, so server bundlers must handle CSS imports as well as client bundlers.

The upstream Close control can unmount the widget before React cleanup runs.
Cleanup checks whether the captured React container still contains the widget app
before calling upstream `unmount()` again. Check containment rather than document
connectivity so widgets in detached containers still release their resources.

### Structural Memoization

Uses the `useStructurallyStableValue` hook with `dequal` for deep equality comparison. This prevents unnecessary widget re-instantiation when options objects are structurally equal but referentially different.

### Custom Hooks (`src/hooks/`)

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

`widgetRef` is populated synchronously in the client layout effect after the instance mounts. A stable callback `widgetRef` can configure each instance and return cleanup. Ref changes alone do not recreate the instance or rerun configuration; updating an object ref does not schedule React effects.

### Initial Motion

`disableBounceOnMount` calls `setState({ r: 0, y: 0.06 })` after mounting. Options changes and changes to this prop recreate the instance.
