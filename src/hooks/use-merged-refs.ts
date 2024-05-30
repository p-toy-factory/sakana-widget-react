import {
	type MutableRefObject,
	type Ref,
	type RefCallback,
	useCallback,
	useRef,
} from "react";

import { isFunction } from "../utils";

type CleanupFunction = () => void;

export function assignRef<T>(
	ref: Ref<T> | undefined,
	instance: T,
): CleanupFunction | undefined {
	if (ref) {
		if (typeof ref === "function") {
			return ref(instance) as CleanupFunction | undefined;
		}
		(ref as MutableRefObject<T>).current = instance;
	}
	return undefined;
}

export function useMergedRefs<T>(
	...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
	const refsCleanupsRef = useRef<
		Array<{
			cleanup: CleanupFunction;
			unmountHandler: CleanupFunction;
		}>
	>([]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const mergedRefsCallback = useCallback<RefCallback<T>>(
		function mergedRefsCallback(instance) {
			const cleanups = refsCleanupsRef.current;
			refsCleanupsRef.current = [];
			if (instance === null) {
				cleanups.forEach((cleanup) => cleanup.unmountHandler());
				return;
			}
			cleanups.forEach((cleanup) => cleanup.cleanup());
			const newCleanups: Array<{
				cleanup: CleanupFunction;
				unmountHandler: CleanupFunction;
			}> = [];
			refs.forEach((ref) => {
				const cleanup = assignRef(ref, instance);
				newCleanups.push(
					isFunction(cleanup)
						? { cleanup, unmountHandler: cleanup }
						: {
								cleanup: noop,
								unmountHandler: () => assignRef(ref, null),
								// eslint-disable-next-line no-mixed-spaces-and-tabs
						  },
				);
			});
			refsCleanupsRef.current = newCleanups;
		},
		refs,
	);

	return mergedRefsCallback;
}

function noop() {}
