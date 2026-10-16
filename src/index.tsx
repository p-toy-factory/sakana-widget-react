"use client";

import { type DetailedHTMLProps, forwardRef, type HTMLAttributes, type Ref } from "react";
import type SakanaWidget from "sakana-widget";
import type { SakanaWidgetOptions } from "sakana-widget";
import { useMergeRefs } from "./hooks/use-merge-refs";
import { useSakanaWidget } from "./hooks/use-sakana-widget";

type DivElementAttributes = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	"key" | "ref"
>;

export type SakanaWidgetApi = Omit<SakanaWidget, "mount" | "unmount">;

export interface SakanaWidgetProps extends DivElementAttributes {
	/** @default false */
	disableBounceOnMount?: boolean;
	widgetRef?: Ref<SakanaWidgetApi>;
	options?: SakanaWidgetOptions;
}

const loadWidget = () => import("sakana-widget").then((module) => module.default);

const SakanaWidgetReact = forwardRef<HTMLDivElement, SakanaWidgetProps>(
	function SakanaWidgetReact(props, ref) {
		const { disableBounceOnMount = false, widgetRef, options, ...divAttrs } = props;
		const divElementRef = useSakanaWidget(loadWidget, options, disableBounceOnMount, widgetRef);

		return <div ref={useMergeRefs(divElementRef, ref)} {...divAttrs} />;
	},
);

export { SakanaWidgetReact, SakanaWidgetReact as SakanaWidget };
