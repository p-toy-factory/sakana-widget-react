import { renderHook } from "@testing-library/react-hooks/native";
import { describe, expect, test } from "vitest";

import { useConsistentReference } from "./use-consistent-reference";
import { createElement, useRef } from "react";

describe("useMergedRefs", () => {
	const initArg = { a: 0 };

	const { result, rerender } = renderHook(
		({ arg }) => {
			const ref = useRef<HTMLDivElement>(null);
			return createElement("div", { ref });
		},
		{ initialProps: { arg: initArg } },
	);

	test("memoize reference", () => {
		const initArgClone = { ...initArg };
		rerender({ arg: initArgClone });
		expect(result.current).toBe(initArg);
	});

	test("change reference", () => {
		const toChange = { a: 1 };
		rerender({ arg: toChange });
		expect(result.current).toBe(toChange);
	});
});
