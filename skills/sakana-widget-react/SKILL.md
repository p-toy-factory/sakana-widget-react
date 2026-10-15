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

- **Compatibility**: `sakana-widget-react` v2 requires `sakana-widget` v4. Both React entries load upstream CSS automatically with the upstream module after mounting in the browser.
- **Entries**: The default entry includes both built-in characters. `sakana-widget-react/core` registers no built-in characters. Before rendering a core component, import the upstream class from `sakana-widget/core`, import a character such as the default export from `sakana-widget/characters/takina`, call `SakanaWidget.registerCharacter("takina", takina)`, and select `options={{ character: "takina" }}`. Avoid importing the default entry elsewhere when selecting individual images.
- **Image fitting**: `options.imageFit` accepts `"cover"` (default) or `"contain"`; use `"contain"` to show the whole tall or wide image.
- **Custom controls**: Use a stable callback `widgetRef` to call `addControl({ id, label, icon, onClick })` for each instance and return cleanup that calls `removeControl(id)`. `icon` must be a DOM `Element`, not JSX; `label` supplies the accessible name. Controls are instance-specific and hidden by `options.controls: false`.
- **Instance changes**: Structurally different options or a changed `disableBounceOnMount` recreate the instance. Changing `widgetRef` alone does not reconfigure it; object ref updates do not trigger effects or renders.
- **Host content**: React children are preserved alongside the widget. `dangerouslySetInnerHTML` is omitted from the supported props because it conflicts with the shared host DOM.
- **Initial motion**: `disableBounceOnMount` starts the widget at rest at the configured rotation equilibrium.

- **SSR**: Both React entries can be imported and rendered on the server. They defer upstream module evaluation and widget creation until mounting in the browser. Direct upstream imports and character registration must also be deferred to client code; render the core component only after registration completes.
- **Programmatic control**: `widgetRef` is populated asynchronously after upstream loading and mounting. Use a stable callback ref for initialization; a parent effect may run before an object ref is populated. Type `widgetRef` as `SakanaWidgetApi` from this package. The API type omits `mount` and `unmount` because React manages the component lifecycle. The runtime ref value remains the upstream widget instance.
- **Upstream documentation**: Read the upstream `sakana-widget` documentation at <https://raw.githubusercontent.com/dsrkafuu/sakana-widget/e386acd3cf399deb990850bdf9d6e32e342db975/README.md> when you work with the upstream `SakanaWidget` class directly.
