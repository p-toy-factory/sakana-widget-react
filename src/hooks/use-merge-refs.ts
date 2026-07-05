import { type Ref, type RefCallback, type RefObject, useCallback, useMemo, useRef } from "react";

type CleanupFunction = () => void;

export function assignRef<T>(ref: Ref<T> | undefined, instance: T): CleanupFunction | undefined {
	if (ref) {
		if (typeof ref === "function") {
			return ref(instance) as CleanupFunction | undefined;
		}
		(ref as RefObject<T>).current = instance;
	}
	return undefined;
}

/**
 * Merges refs into a single memoized callback ref or `null`.
 *
 * Copied from https://github.com/mui/base-ui/blob/2934e672ceb5ae4ca3bf4b2af21bfd5269727da5/packages/react/src/utils/useForkRef.ts and customized.
 */
export const useMergeRefs = <Instance>(
	...refs: (Ref<Instance> | undefined)[]
): RefCallback<Instance> | null => {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const memoizedRefs = useMemo(() => refs, refs);

	const cleanupRef = useRef<CleanupFunction | undefined>(undefined);

	const refEffect = useCallback(
		(instance: Instance) => {
			const cleanups = memoizedRefs.map((ref) => {
				if (ref === null || ref === undefined) {
					return null;
				}

				if (typeof ref === "function") {
					const refCallback = ref;
					const refCleanup = refCallback(instance);
					return typeof refCleanup === "function"
						? refCleanup
						: () => {
								refCallback(null);
							};
				}

				(ref as RefObject<Instance | null>).current = instance;
				return () => {
					(ref as RefObject<Instance | null>).current = null;
				};
			});

			return () => {
				cleanups.forEach((refCleanup) => refCleanup?.());
			};
		},
		[memoizedRefs],
	);

	return useMemo(() => {
		if (memoizedRefs.every((ref) => ref === null || ref === undefined)) {
			return null;
		}

		return (value) => {
			if (cleanupRef.current) {
				cleanupRef.current();
				cleanupRef.current = undefined;
			}

			if (value !== null) {
				cleanupRef.current = refEffect(value);
			}
		};
	}, [memoizedRefs, refEffect]);
};
