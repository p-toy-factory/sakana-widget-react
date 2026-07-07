"use client";

import { type DetailedHTMLProps, forwardRef, type HTMLAttributes, type Ref, useRef } from "react";
import SakanaWidget, { type SakanaWidgetOptions } from "sakana-widget";
import { useIsomorphicLayoutEffect } from "./hooks/use-isomorphic-layout-effect";

import { assignRef, useMergeRefs } from "./hooks/use-merge-refs";
import { useStructurallyStableValue } from "./hooks/use-structurally-stable-value";

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

const SakanaWidgetReact = forwardRef<HTMLDivElement, SakanaWidgetProps>(
	function SakanaWidgetReact(props, ref) {
		const { disableBounceOnMount = false, widgetRef, options, ...divAttrs } = props;
		const divElementRef = useRef<HTMLDivElement>(null);
		const stableOptions = useStructurallyStableValue(options);

		useIsomorphicLayoutEffect(() => {
			const instance = new SakanaWidget(stableOptions);

			// #region Change GitHub icon link
			// @ts-expect-error Get private property
			const domApp = instance._domApp as HTMLDivElement;
			const githubIconDom: HTMLAnchorElement | null = domApp.querySelector(
				"a.sakana-widget-ctrl-item",
			);
			if (githubIconDom) {
				githubIconDom.href = "https://github.com/p-toy-factory/sakana-widget-react";
			}
			// #endregion

			/**
			 * The div element will be replaced during calling `SakanaWidget.mount`
			 * @see https://github.com/dsrkafuu/sakana-widget/blob/69dbdd85688425ece3f17c1abc7c92effe842704/src/index.ts#L665C28-L665C28
			 */
			const div = document.createElement("div");
			divElementRef.current!.replaceChildren(div);
			instance.mount(div);

			if (disableBounceOnMount) {
				instance.setState({ r: 0, y: 0.06 });
			}

			const refCleanup = assignRef(widgetRef, instance as SakanaWidgetApi);

			return () => {
				if (typeof refCleanup === "function") {
					refCleanup();
				} else {
					assignRef(widgetRef, null);
				}
				instance.unmount();
			};
		}, [disableBounceOnMount, stableOptions]);

		return <div ref={useMergeRefs(divElementRef, ref)} {...divAttrs} />;
	},
);

export { SakanaWidgetReact, SakanaWidgetReact as SakanaWidget };
