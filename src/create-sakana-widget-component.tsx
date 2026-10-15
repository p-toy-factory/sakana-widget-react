"use client";

import {
	type DetailedHTMLProps,
	forwardRef,
	type HTMLAttributes,
	type Ref,
	useRef,
	useState,
} from "react";
import type SakanaWidget from "sakana-widget/core";
import type { SakanaWidgetOptions, SakanaWidgetState } from "sakana-widget/core";
import { useIsomorphicLayoutEffect } from "./hooks/use-isomorphic-layout-effect";

import { assignRef, useMergeRefs } from "./hooks/use-merge-refs";
import { useStructurallyStableValue } from "./hooks/use-structurally-stable-value";

type DivElementAttributes = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	"key" | "ref" | "dangerouslySetInnerHTML"
>;

export type SakanaWidgetApi<Widget = SakanaWidget> = Omit<Widget, "mount" | "unmount">;

export interface SakanaWidgetProps<Widget = SakanaWidget> extends DivElementAttributes {
	/** @default false */
	disableBounceOnMount?: boolean;
	widgetRef?: Ref<SakanaWidgetApi<Widget>>;
	options?: SakanaWidgetOptions;
}

// Upstream emits separate class declarations for its default and core entries.
// Use the lifecycle contract to avoid comparing their private members.
interface WidgetLifecycle {
	mount(host: HTMLElement): void;
	unmount(): void;
	setState(state: Partial<SakanaWidgetState>): void;
}

export function createSakanaWidgetComponent<Widget extends WidgetLifecycle>(
	loadWidget: () => Promise<new (options?: SakanaWidgetOptions) => Widget>,
) {
	return forwardRef<HTMLDivElement, SakanaWidgetProps<Widget>>(
		function SakanaWidgetReact(props, ref) {
			const { disableBounceOnMount = false, widgetRef, options, children, ...divAttrs } = props;
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
						const host = divElementRef.current!;

						if (disableBounceOnMount) {
							instance.setState({
								r: -Math.min(120, Math.max(0, stableOptions?.rotate ?? 0)) / 2,
								y: 0,
								t: 0,
								w: 0,
							});
						}

						instance.mount(host);
						const widgetNode = host.lastElementChild!;
						const githubLink = widgetNode.querySelector<HTMLAnchorElement>(
							"a.sakana-widget-ctrl-item",
						);
						if (githubLink) {
							githubLink.href = "https://github.com/p-toy-factory/sakana-widget-react";
						}

						let refCleanup: ReturnType<typeof assignRef> = undefined;

						cleanup = () => {
							try {
								if (typeof refCleanup === "function") {
									refCleanup();
								} else {
									assignRef(widgetRef, null);
								}
							} finally {
								// The built-in Close button may have already unmounted this instance.
								if (widgetNode.parentNode === host) {
									instance.unmount();
								}
							}
						};
						refCleanup = assignRef(widgetRef, instance as SakanaWidgetApi<Widget>);
					})
					.catch((error: unknown) => {
						if (!cancelled) setFailure({ error });
					});

				return () => {
					cancelled = true;
					cleanup?.();
				};
			}, [disableBounceOnMount, stableOptions]);

			const mergedRef = useMergeRefs(divElementRef, ref);
			if (failure) throw failure.error;
			return (
				<div ref={mergedRef} {...divAttrs}>
					<>{children}</>
				</div>
			);
		},
	);
}
