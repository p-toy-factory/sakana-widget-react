import { forwardRef } from "react";
import chisato from "sakana-widget/characters/chisato";
import takina from "sakana-widget/characters/takina";
import type SakanaWidget from "sakana-widget/core";
import { SakanaWidget as Core, type SakanaWidgetProps as CoreProps } from "./core";

export type { SakanaWidgetApi } from "./core";
export type SakanaWidgetProps = Omit<CoreProps, "initializer">;

function once<Args extends unknown[]>(fn: (...args: Args) => void) {
	let called = false;
	return (...args: Args) => {
		if (called) return;
		fn(...args);
		called = true;
	};
}

const initialize = once((Widget: typeof SakanaWidget) => {
	Widget.registerCharacter("chisato", chisato);
	Widget.registerCharacter("takina", takina);
});

const SakanaWidgetReact = forwardRef<HTMLDivElement, SakanaWidgetProps>(
	function SakanaWidgetReact(props, ref) {
		return <Core {...props} ref={ref} initializer={initialize} />;
	},
);

export { SakanaWidgetReact, SakanaWidgetReact as SakanaWidget };
