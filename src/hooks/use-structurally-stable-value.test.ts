import { renderHook } from "@testing-library/react-hooks/native";
import { describe, expect, test } from "vitest";

import { useStructurallyStableValue } from "./use-structurally-stable-value";

describe(useStructurallyStableValue.name, () => {
	test("memoize reference", () => {
		const initArg = { a: 0 };
		const { result, rerender } = renderHook(({ arg }) => useStructurallyStableValue(arg), {
			initialProps: { arg: initArg },
		});
		const initArgClone = { ...initArg };
		rerender({ arg: initArgClone });
		expect(result.current).toBe(initArg);
	});

	test("reuse cached when original reference returns", () => {
		const initArg = { a: 0 };
		const { result, rerender } = renderHook(({ arg }) => useStructurallyStableValue(arg), {
			initialProps: { arg: initArg },
		});
		const initArgClone = { ...initArg };
		rerender({ arg: initArgClone });
		rerender({ arg: initArg });
		expect(result.current).toBe(initArg);
	});

	test("change reference", () => {
		const initArg = { a: 0 };
		const { result, rerender } = renderHook(({ arg }) => useStructurallyStableValue(arg), {
			initialProps: { arg: initArg },
		});
		const toChange = { a: 1 };
		rerender({ arg: toChange });
		expect(result.current).toBe(toChange);
	});
});
