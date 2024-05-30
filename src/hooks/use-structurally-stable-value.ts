import { dequal } from "dequal";
import { useState } from "react";

export const useStructurallyStableValue = <T>(passthrough: T): T => {
	const [{ cachedReference, prevPassthrough }, set] = useState<{
		cachedReference: T;
		prevPassthrough: T;
	}>(() => ({
		cachedReference: passthrough,
		prevPassthrough: passthrough,
	}));

	if (
		Object.is(passthrough, prevPassthrough) ||
		Object.is(passthrough, cachedReference)
	) {
		return cachedReference;
	}

	if (dequal(cachedReference, passthrough)) {
		set((prevState) => ({ ...prevState, prevPassthrough: passthrough }));
		return cachedReference;
	}

	set({ cachedReference: passthrough, prevPassthrough: passthrough });
	return passthrough;
};
