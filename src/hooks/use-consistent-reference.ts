import { dequal } from "dequal";
import { useRef } from "react";

export const useConsistentReference = <T>(arg: T): T => {
	const ref = useRef<{
		memoized: T;
		prev: T;
	}>();

	if (ref.current) {
		const { memoized, prev } = ref.current;
		if (arg === prev) {
			return memoized;
		}
		if (dequal(memoized, arg)) {
			ref.current = {
				...ref.current,
				prev: arg,
			};
			return memoized;
		}
	}

	ref.current = {
		memoized: arg,
		prev: arg,
	};
	return arg;
};
