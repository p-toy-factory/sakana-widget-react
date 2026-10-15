# Changelog

## v2.0.0

Breaking changes:

- Require `sakana-widget` v4; support for upstream v2 and v3 has been removed.

Other changes:

- Import upstream CSS automatically. Client and SSR bundlers must support CSS imports.
- Support the v4 `imageFit` option and custom controls through `widgetRef`.
- Add `sakana-widget-react/core` with an optional `initializer` for custom character registration before synchronous widget creation and mounting.
- Register built-in characters once through the default entry; widget creation and initializers run only in the browser.

**Full Changelog**: https://github.com/p-toy-factory/sakana-widget-react/compare/v1.0.1...v2.0.0

## v1.0.1

- Fix a duplicate `unmount()` call when React cleanup follows the widget Close action.

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
