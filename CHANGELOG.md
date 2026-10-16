# Changelog

## v2.0.0

Breaking changes:

- Require `sakana-widget` v4; support for upstream v2 and v3 has been removed.
- `widgetRef` is populated asynchronously after the widget loads and mounts. Use a stable callback ref for initialization.

Other changes:

- Both React entries load upstream CSS automatically in the browser. Your client bundler must support CSS imports.
- Add `sakana-widget-react/core` for applications that register selected or custom characters. The default entry still includes both built-in characters.
- Support the v4 `imageFit` option and custom controls through `widgetRef`.
- Defer upstream loading until client mount for SSR imports and rendering; cancel pending initialization when props change or the component unmounts.
- Avoid a second unmount when an upstream close control has already unmounted the widget.
- Start at the configured rotation equilibrium when `disableBounceOnMount` is enabled.

**Full Changelog**: https://github.com/p-toy-factory/sakana-widget-react/compare/v1.0.0...v2.0.0

## v1.0.0

Breaking changes:

- Build output is now ESM-only; CommonJS support has been removed.

- Remove the `state` prop. Use `widgetRef` to access the widget instance and call `setState` instead.

- Add `widgetRef`, `SakanaWidgetApi`, and ref forwarding to the host `<div>` for programmatic widget access. `SakanaWidgetApi` excludes `mount` and `unmount`, which remain managed by React.
- Add `SakanaWidgetReact` as an alias for `SakanaWidget` to avoid naming conflicts with the upstream class.
- Support React 19 and `sakana-widget` v3.

**Full Changelog**: https://github.com/p-toy-factory/sakana-widget-react/compare/v0.3.0...v1.0.0

## v0.3.0

- feat: support `disableBounceOnMount` prop
- feat: avoid unmount on `options` prop change

**Full Changelog**: https://github.com/p-toy-factory/sakana-widget-react/compare/v0.2.0...v0.3.0

## v0.2.0

Breaking change:

- feat!: props type change for performance. (See new README for new API)

## v0.1.0
