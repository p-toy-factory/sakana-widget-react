# 🐟「Sakana! Widget React」

![Banner](https://socialify.git.ci/p-toy-factory/sakana-widget-react/image?font=KoHo&forks=1&issues=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fdsrkafuu%2Fsakana-widget%2Fmain%2Fsrc%2Fcharacters%2Fchisato.png&name=1&pattern=Formal%20Invitation&pulls=1&stargazers=1&theme=Auto)

A [React](https://react.dev/) component that wrap [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

[See demo](https://sakana-widget-react.vercel.app/)

## Quick Start

### Install

```
npm install sakana-widget sakana-widget-react
```

### Import CSS file

See [usage of Sanaka! Widget's README](https://github.com/dsrkafuu/sakana-widget/tree/main?tab=readme-ov-file#usage), choose a method you prefer.

### Use component

The props of **SanakaWidget component** will be used as parameter of construct of **SanakaWidget class**.

```tsx
import { SanakaWidget } from "sakana-widget-react";

function App() {
  return <SanakaWidget character="takina" title />;
}
```

## API

### Props

```ts
import { CSSProperties } from "react";
import { SakanaWidgetOptions } from "sakana-widget";

export interface SakanaWidgetProps extends SakanaWidgetOptions {
  className?: string;
  style?: CSSProperties;
}
```

## License

Released under MIT License, please note that the 2 default images **should not be used for any commercial activities**. This project used to be a secondary development based on [Sakana! Widget](https://github.com/dsrkafuu/sakana-widget).

Image source: 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
