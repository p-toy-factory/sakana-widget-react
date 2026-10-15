---
name: sakana-widget-react
description: Usage of npm package sakana-widget-react
disable-model-invocation: false
user-invocable: false
---

# sakana-widget-react

A React component wrapper for [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

Read [README.md](../../README.md) for installation, automatic CSS imports, usage examples, and full API documentation.

## Notes

- **React client boundary**: Both published JavaScript entries start with `"use client"`, emitted by the build configuration. React Server Component frameworks treat imports from this package as a client boundary.
- **Compatibility**: `sakana-widget-react` v2 requires `sakana-widget` v4. CSS is imported automatically; bundlers must support CSS imports for client and server builds.
- **Characters**: The default entry includes both built-in characters and registers them once. Use `sakana-widget-react/core` for custom characters; it exports the same `SakanaWidget` and `SakanaWidgetReact` aliases without registering built-ins. Its `SakanaWidgetProps` accepts `initializer?: (Widget: typeof import("sakana-widget/core").default) => void`. Register characters through this callback before widget creation; it runs in the browser and must be safe to call repeatedly. Import the upstream class and types from `sakana-widget/core` when needed. The default entry does not expose `initializer`.
- **Image fitting**: `options.imageFit` accepts `"cover"` (default) or `"contain"`; use `"contain"` to show the whole tall or wide image.
- **Custom controls**: Use a stable callback `widgetRef` to call `addControl({ id, label, icon, onClick })` for each instance and return cleanup that calls `removeControl(id)`. `icon` must be a DOM `Element`, not JSX; `label` supplies the accessible name. Controls are instance-specific and hidden by `options.controls: false`.
- **Instance changes**: Structurally different options or a changed `disableBounceOnMount` or core `initializer` recreate the instance. Changing `widgetRef` alone does not reconfigure it; object ref updates do not trigger effects or renders.
- **Initial motion**: `disableBounceOnMount` disables the initial bounce.
- **SSR**: The component can be imported and rendered with an SSR bundler that handles CSS imports. Widget creation and initializers run only in the browser. Use `sakana-widget/core` for direct upstream imports and register characters inside the initializer.
- **Programmatic control**: `widgetRef` is populated after mounting in the client layout effect. Use a stable callback ref to initialize each instance. Type `widgetRef` as `SakanaWidgetApi` from this package. The API type omits `mount` and `unmount` because React manages the component lifecycle. The runtime ref value remains the upstream widget instance.
- **Upstream documentation**: Read the upstream `sakana-widget` documentation at <https://raw.githubusercontent.com/dsrkafuu/sakana-widget/e386acd3cf399deb990850bdf9d6e32e342db975/README.md> when you work with the upstream `SakanaWidget` class directly.
