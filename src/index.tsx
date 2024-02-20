"use client";

import {
	type DetailedHTMLProps,
	type HTMLAttributes,
	useEffect,
	useRef,
} from "react";
import SakanaWidgetClass, {
	type SakanaWidgetOptions,
	type SakanaWidgetState,
} from "sakana-widget";

import { useConsistentReference } from "./hooks/use-consistent-reference";

type DivElementAttributes = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	"key" | "ref"
>;

export interface SakanaWidgetProps extends DivElementAttributes {
	/** @default false */
	disableBounceOnMount?: boolean;
	options?: SakanaWidgetOptions;
	state?: Partial<SakanaWidgetState>;
}

export const SakanaWidget = (props: SakanaWidgetProps) => {
	const { disableBounceOnMount = false, state, ...divAttrs } = props;
	const ref = useRef<HTMLDivElement>(null);
	const instanceRef = useRef<SakanaWidgetClass>();
	const options = useConsistentReference(props.options);

	useEffect(() => {
		let hasUnmounted = false;
		const instance = new SakanaWidgetClass(options);

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

		instanceRef.current = instance;

		if (disableBounceOnMount) {
			instance.setState({ r: 0, y: 0.06 });
		}

		/**
		 * The div element will be replaced during calling `SakanaWidget.mount`
		 * @see https://github.com/dsrkafuu/sakana-widget/blob/69dbdd85688425ece3f17c1abc7c92effe842704/src/index.ts#L665C28-L665C28
		 */
		const div = document.createElement("div");
		ref.current!.replaceChildren(div);
		instance.mount(div);

		return () => {
			instanceRef.current = undefined;
			if (!hasUnmounted) {
				instance.unmount();
			}
		};
	}, [disableBounceOnMount, options]);

	useEffect(() => {
		if (state) {
			instanceRef.current!.setState(state);
		}
	}, [state]);

	return <div ref={ref} {...divAttrs} />;
};
