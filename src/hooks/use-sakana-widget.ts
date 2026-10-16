import { type Ref, useRef, useState } from "react";
import type { SakanaWidgetOptions, SakanaWidgetState } from "sakana-widget/core";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";
import { assignRef } from "./use-merge-refs";
import { useStructurallyStableValue } from "./use-structurally-stable-value";

// The upstream entries have separate class declarations with incompatible private members.
interface WidgetLifecycle {
	mount(host: HTMLElement): void;
	unmount(): void;
	setState(state: Partial<SakanaWidgetState>): void;
}

export function useSakanaWidget<Widget extends WidgetLifecycle>(
	loadWidget: () => Promise<new (options?: SakanaWidgetOptions) => Widget>,
	options: SakanaWidgetOptions | undefined,
	disableBounceOnMount: boolean,
	widgetRef: Ref<Omit<Widget, "mount" | "unmount">> | undefined,
) {
	const divElementRef = useRef<HTMLDivElement>(null);
	const stableOptions = useStructurallyStableValue(options);
	const [failure, setFailure] = useState<{ error: unknown } | null>(null);

	useIsomorphicLayoutEffect(() => {
		let cancelled = false;
		let cleanup: (() => void) | undefined;

		void loadWidget()
			.then((WidgetClass) => {
				if (cancelled) return;
				const instance = new WidgetClass(stableOptions);
				const div = document.createElement("div");
				divElementRef.current!.replaceChildren(div);
				instance.mount(div);
				const widgetNode = div.firstElementChild!;

				// #region Change GitHub icon link
				const githubIconDom = div.querySelector<HTMLAnchorElement>("a.sakana-widget-ctrl-item");
				if (githubIconDom) {
					githubIconDom.href = "https://github.com/p-toy-factory/sakana-widget-react";
				}
				// #endregion

				if (disableBounceOnMount) {
					instance.setState({
						r: -Math.min(120, Math.max(0, stableOptions?.rotate ?? 0)) / 2,
						y: 0,
						t: 0,
						w: 0,
					});
				}

				let refAssigned = false;
				const clearRef = () => {
					if (typeof refCleanup === "function") {
						refCleanup();
					} else {
						assignRef(widgetRef, null);
					}
				};
				cleanup = () => {
					try {
						if (refAssigned) clearRef();
					} finally {
						// The upstream Close control may already have unmounted the widget.
						if (widgetNode.parentNode === div) instance.unmount();
					}
				};
				const refCleanup = assignRef(widgetRef, instance);
				refAssigned = true;
				// A callback ref can synchronously unmount before returning its cleanup.
				if (cancelled) clearRef();
			})
			.catch((error: unknown) => {
				if (!cancelled) setFailure({ error });
			});

		return () => {
			cancelled = true;
			cleanup?.();
		};
	}, [loadWidget, disableBounceOnMount, stableOptions]);

	if (failure) throw failure.error;
	return divElementRef;
}
