import { renderHook } from "@testing-library/react-hooks/native";
import { describe, expect, test } from "vitest";

import { useConsistentReference } from "./use-consistent-reference";

describe("useConsistentReference", () => {
	const initArg = { a: 0 };

	const { result, rerender } = renderHook(
		({ arg }) => useConsistentReference(arg),
		{ initialProps: { arg: initArg } }
	);

	test("Memoize reference", () => {
		const initArgClone = { ...initArg };
		rerender({ arg: initArgClone });
		expect(result.current).toBe(initArg);
	});

	test("Change reference", () => {
		const toChange = { a: 1 };
		rerender({ arg: toChange });
		expect(result.current).toBe(toChange);
	});
});
