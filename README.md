# 🐟「Sakana! Widget React」

![Banner](https://socialify.git.ci/p-toy-factory/sakana-widget-react/image?font=KoHo&forks=1&issues=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fdsrkafuu%2Fsakana-widget%2Fmain%2Fsrc%2Fcharacters%2Fchisato.png&name=1&pattern=Formal%20Invitation&pulls=1&stargazers=1&theme=Auto)

A [React](https://react.dev/) component that wraps [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

[See demo](https://sakana-widget-react.pages.dev/)

## Quick Start

### Install

```
npm install sakana-widget-react sakana-widget@^4.0.0
```

Version 2 of this wrapper requires `sakana-widget` 4. Versions 2 and 3 of the upstream package are no longer supported.

### Styles

CSS is imported automatically; no separate CSS import is needed. Your bundler
must support CSS imports, including when using server-side rendering.

### Use component

`options` property of **SakanaWidget component** will be used as parameter of constructor of **SakanaWidget class**.

```tsx
import { SakanaWidget } from "sakana-widget-react";

function App() {
	return (
		<SakanaWidget
			options={{
				character: "takina",
				title: true,
			}}
		/>
	);
}
```

If you need to use both `sakana-widget` and `sakana-widget-react` in the same file, import `SakanaWidgetReact` to avoid naming conflicts:

```tsx
import SakanaWidget from "sakana-widget/core";
import { SakanaWidgetReact } from "sakana-widget-react";
```

Both built-in characters are included.

### Custom characters

Use `sakana-widget-react/core` and register your character in `initializer`:

```tsx
import type SakanaWidget from "sakana-widget/core";
import { SakanaWidgetReact } from "sakana-widget-react/core";

function initializeCharacters(Widget: typeof SakanaWidget) {
	Widget.registerCharacter("custom", {
		image: "/character.png",
		initialState: { i: 0.1, s: 0.95, d: 0.98, r: 0, y: 0, t: 0, w: 0 },
	});
}

function App() {
	return (
		<SakanaWidgetReact initializer={initializeCharacters} options={{ character: "custom" }} />
	);
}
```

`initializer` runs in the browser before each widget is created, so it must be safe
to call repeatedly. Keep the function stable; changing it recreates the widget.
The core entry also exports the component as `SakanaWidget` and does not register
built-in characters for you. When using the upstream class directly, import it
from `sakana-widget/core`.

### Fit character images

Set `options={{ imageFit: "contain" }}` to show an entire tall or wide image inside
the square image area. The default, `"cover"`, fills the area and can crop the image.

## API

### Props

```ts
import { type DetailedHTMLProps, type HTMLAttributes, type Ref } from "react";
import type SakanaWidget from "sakana-widget/core";
import type { SakanaWidgetOptions } from "sakana-widget/core";

type DivElementAttributes = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	"key" | "ref"
>;

export interface SakanaWidgetProps extends DivElementAttributes {
	/** @default false */
	disableBounceOnMount?: boolean;
	widgetRef?: Ref<SakanaWidgetApi>;
	options?: SakanaWidgetOptions;
}

export type SakanaWidgetApi = Omit<SakanaWidget, "mount" | "unmount">;
```

The component forwards standard `<div>` attributes to its root container and
forwards the regular React `ref` to that container. Use `widgetRef` for the
Sakana widget instance itself. Use `SakanaWidgetApi` for programmatic controls;
React manages mounting and unmounting.

Changes to `options` or `disableBounceOnMount` recreate the widget. Structurally
equal options preserve the existing instance. `disableBounceOnMount` disables the
initial bounce.

The `sakana-widget-react/core` entry exports the same component aliases and API
handle type. Its `SakanaWidgetProps` also accepts:

```ts
initializer?: (Widget: typeof import("sakana-widget/core").default) => void;
```

The default entry does not accept `initializer`; use the core entry for custom
character registration. Built-in characters in the default entry are registered
once.

### Programmatic Control

Use `widgetRef` to access the public widget handle after mounting. Use a stable
callback ref (as in the custom controls example below) to initialize each instance.
React owns the widget lifecycle, so the TypeScript handle type omits `mount` and `unmount`:

```tsx
import { useRef } from "react";
import { SakanaWidget, type SakanaWidgetApi } from "sakana-widget-react";

function App() {
	const widgetRef = useRef<SakanaWidgetApi>(null);

	const handleClick = () => {
		widgetRef.current?.setState({ r: 1, y: 0.2 });
	};

	return (
		<>
			<button onClick={handleClick}>Bounce!</button>
			<SakanaWidget widgetRef={widgetRef} />
		</>
	);
}
```

### Custom controls

Use a stable callback `widgetRef` to configure each new instance. The wrapper calls
its returned cleanup when that instance is replaced or the component unmounts:

```tsx
import { useCallback } from "react";
import { SakanaWidget, type SakanaWidgetApi } from "sakana-widget-react";

function App() {
	const configureWidget = useCallback((widget: SakanaWidgetApi | null) => {
		if (!widget) return;
		const icon = document.createElement("span");
		icon.textContent = "↻";
		widget.addControl({
			id: "bounce",
			label: "Bounce",
			icon,
			onClick: () => widget.setState({ r: 1, y: 0.2 }),
		});
		return () => {
			widget.removeControl("bounce");
		};
	}, []);

	return <SakanaWidget widgetRef={configureWidget} />;
}
```

`icon` must be a DOM `Element`, not JSX; the upstream widget clones it. `label`
sets the accessible name, not visible text. Controls belong to one instance and
are hidden when `options.controls` is `false`. Keep the callback stable; changing
`widgetRef` alone does not recreate or reconfigure the widget. Updating an object
ref's `.current` does not trigger a React render or effect.

For the upstream API, see the [v4 documentation](https://github.com/dsrkafuu/sakana-widget/blob/e386acd3cf399deb990850bdf9d6e32e342db975/README.md).

## License

Released under MIT License, please note that the 2 default images **should not be used for any commercial activities**. This project used to be a secondary development based on [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

Image source: 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)

## Contributing

See [CONTRIBUTING.md](https://github.com/p-toy-factory/sakana-widget-react/blob/main/CONTRIBUTING.md) for the repo-managed `pnpm` workflow.
