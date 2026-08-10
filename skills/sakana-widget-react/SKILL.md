---
name: sakana-widget-react
description: Usage of npm package sakana-widget-react
disable-model-invocation: false
user-invocable: false
---

# sakana-widget-react

A React component wrapper for [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

Read [README.md](../../README.md) for installation, CSS import, usage examples, and full API documentation.

## Notes

- **SSR safe**: The component includes a `"use client"` directive. You can import it directly in Next.js or other SSR frameworks without dynamic imports.
- **Programmatic control**: Type `widgetRef` as `SakanaWidgetApi` from this package. The API type omits `mount` and `unmount` because React manages the component lifecycle. The runtime ref value remains the upstream widget instance.
- **Upstream documentation**: Read the upstream `sakana-widget` documentation at <https://raw.githubusercontent.com/dsrkafuu/sakana-widget/64710524b53b83a08a15758fbe332a926e4add82/README.md> when you work with the upstream `SakanaWidget` class directly.
