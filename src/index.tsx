"use client";

import type SakanaWidget from "sakana-widget";
import {
	createSakanaWidgetComponent,
	type SakanaWidgetApi as WidgetApi,
	type SakanaWidgetProps as WidgetProps,
} from "./create-sakana-widget-component";

const SakanaWidgetReact = createSakanaWidgetComponent(() =>
	import("sakana-widget").then((module) => module.default),
);

export { SakanaWidgetReact, SakanaWidgetReact as SakanaWidget };
export type SakanaWidgetApi = WidgetApi<SakanaWidget>;
export type SakanaWidgetProps = WidgetProps<SakanaWidget>;
