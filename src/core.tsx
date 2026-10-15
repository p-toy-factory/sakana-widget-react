import { type DetailedHTMLProps, forwardRef, type HTMLAttributes, type Ref, useRef } from "react";
import SakanaWidget, { type SakanaWidgetOptions } from "sakana-widget/core";
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
	initializer?: (Widget: typeof SakanaWidget) => void;
}

const SakanaWidgetReact = forwardRef<HTMLDivElement, SakanaWidgetProps>(
	function SakanaWidgetReact(props, ref) {
		const { disableBounceOnMount = false, widgetRef, options, initializer, ...divAttrs } = props;
		const divElementRef = useRef<HTMLDivElement>(null);
		const stableOptions = useStructurallyStableValue(options);

		useIsomorphicLayoutEffect(() => {
			initializer?.(SakanaWidget);
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

			const div = divElementRef.current!;
			div.replaceChildren();
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
				// Close may have already unmounted this instance.
				if (div.contains(domApp)) {
					instance.unmount();
				}
			};
		}, [disableBounceOnMount, stableOptions, initializer]);

		return <div ref={useMergeRefs(divElementRef, ref)} {...divAttrs} />;
	},
);

export { SakanaWidgetReact, SakanaWidgetReact as SakanaWidget };
