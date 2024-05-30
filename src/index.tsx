"use client";

import {
	type DetailedHTMLProps,
	forwardRef,
	type HTMLAttributes,
	type Ref,
	useRef,
} from "react";
import SakanaWidgetClass, { type SakanaWidgetOptions } from "sakana-widget";

import { useConsistentReference } from "./hooks/use-consistent-reference";
import { useIsomorphicLayoutEffect } from "./hooks/use-isomorphic-layout-effect";
import { assignRef, useMergedRefs } from "./hooks/use-merged-refs";
import { isFunction } from "./utils";

type DivElementAttributes = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	"key" | "ref"
>;

export interface SakanaWidgetProps extends DivElementAttributes {
	/** @default false */
	disableBounceOnMount?: boolean;
	innerRef?: Ref<SakanaWidgetClass>;
	options?: SakanaWidgetOptions;
}

export const SakanaWidget = forwardRef<HTMLDivElement, SakanaWidgetProps>(
	function SakanaWidget(props, ref) {
		const {
			disableBounceOnMount = false,
			innerRef,
			options,
			...divAttrs
		} = props;
		const divElementRef = useRef<HTMLDivElement>(null);
		const consistentOptions = useConsistentReference(options);

		useIsomorphicLayoutEffect(() => {
			let hasUnmounted = false;
			const instance = new SakanaWidgetClass(consistentOptions);

			// #region Override `SakanaWidget.unmount`
			const originalUnmount = instance.unmount;
			instance.unmount = () => {
				hasUnmounted = true;
				return originalUnmount();
			};
			// #endregion

			// #region Change GitHub icon link
			// @ts-expect-error Get private property
			const domApp = instance._domApp as HTMLDivElement;
			const githubIconDom: HTMLAnchorElement | null = domApp.querySelector(
				"a.sakana-widget-ctrl-item",
			);
			if (githubIconDom) {
				githubIconDom.href =
					"https://github.com/p-toy-factory/sakana-widget-react";
			}
			// #endregion

			if (disableBounceOnMount) {
				instance.setState({ r: 0, y: 0.06 });
			}

			const refCleanup = assignRef(innerRef, instance);

			/**
			 * The div element will be replaced during calling `SakanaWidget.mount`
			 * @see https://github.com/dsrkafuu/sakana-widget/blob/69dbdd85688425ece3f17c1abc7c92effe842704/src/index.ts#L665C28-L665C28
			 */
			const div = document.createElement("div");
			divElementRef.current!.replaceChildren(div);
			instance.mount(div);

			return () => {
				if (isFunction(refCleanup)) {
					refCleanup();
				} else {
					assignRef(innerRef, null);
				}
				if (!hasUnmounted) {
					instance.unmount();
				}
			};
		}, [disableBounceOnMount, consistentOptions]);

		return <div ref={useMergedRefs(divElementRef, ref)} {...divAttrs} />;
	},
);
