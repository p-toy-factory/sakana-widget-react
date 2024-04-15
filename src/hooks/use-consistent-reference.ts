import { dequal } from "dequal";
import { useState } from "react";

export const useConsistentReference = <T>(passthrough: T): T => {
	const [{ cachedValue, prevPassthrough }, set] = useState(() => ({
		cachedValue: passthrough,
		prevPassthrough: passthrough,
	}));

	if (passthrough === prevPassthrough) {
		return cachedValue;
	}

	if (dequal(cachedValue, passthrough)) {
		set((prevState) => ({ ...prevState, prevPassthrough: passthrough }));
		return cachedValue;
	}

	set({ cachedValue: passthrough, prevPassthrough: passthrough });
	return passthrough;
};
