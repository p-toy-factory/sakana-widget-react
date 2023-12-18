"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import SakanaWidgetClass, { type SakanaWidgetOptions } from "sakana-widget";

export interface SakanaWidgetProps extends SakanaWidgetOptions {
	className?: string;
	style?: CSSProperties;
}

export const SakanaWidget = ({
	className,
	style,
	...sakanaWidgetOptions
}: SakanaWidgetProps) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let hasUnmounted = false;

		const instance = new SakanaWidgetClass(sakanaWidgetOptions);
		const originalUnmount = instance.unmount;
		instance.unmount = () => {
			hasUnmounted = true;
			return originalUnmount();
		};
		/**
		 * The div element will be replaced during calling `SakanaWidget.mount`
		 * @see https://github.com/dsrkafuu/sakana-widget/blob/69dbdd85688425ece3f17c1abc7c92effe842704/src/index.ts#L665C28-L665C28
		 */
		const div = document.createElement("div");
		ref.current!.replaceChildren(div);
		instance.mount(div);

		return () => {
			if (!hasUnmounted) {
				instance.unmount();
			}
		};
	}, [sakanaWidgetOptions]);

	return <div className={className} style={style} ref={ref} />;
};
