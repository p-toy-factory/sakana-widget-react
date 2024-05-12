# 🐟「Sakana! Widget React」

![Banner](https://socialify.git.ci/p-toy-factory/sakana-widget-react/image?font=KoHo&forks=1&issues=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fdsrkafuu%2Fsakana-widget%2Fmain%2Fsrc%2Fcharacters%2Fchisato.png&name=1&pattern=Formal%20Invitation&pulls=1&stargazers=1&theme=Auto)

A [React](https://react.dev/) component that wrap [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

[See demo](https://sakana-widget-react.pages.dev/)


## Quick Start

### Install

```
npm install sakana-widget sakana-widget-react
```

### Import CSS

See [usage of Sanaka! Widget's README](https://github.com/dsrkafuu/sakana-widget/tree/main?tab=readme-ov-file#usage), choose a method you prefer to import CSS.

### Use component

`options` property of **SanakaWidget component** will be used as parameter of constructor of **SanakaWidget class**.

```tsx
import { SanakaWidget } from "sakana-widget-react";

function App() {
	return (
		<SanakaWidget
			options={{
				character: "takina",
				title: true,
			}}
		/>
	);
}
```

## API

### Props

```ts
import { type DetailedHTMLProps, type HTMLAttributes } from "react";
import { SakanaWidgetOptions } from "sakana-widget";

type DivElementAttributes = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	"key" | "ref"
>;

export interface SakanaWidgetProps extends DivElementAttributes {
	/** @default false */
	disableBounceOnMount?: boolean;
	options: SakanaWidgetOptions;
}
```

## License

Released under MIT License, please note that the 2 default images **should not be used for any commercial activities**. This project used to be a secondary development based on [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

Image source: 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)

## Contributing

See [CONTRIBUTING.md](https://github.com/p-toy-factory/sakana-widget-react/blob/main/CONTRIBUTING.md).
