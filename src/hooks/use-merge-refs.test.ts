import { renderHook } from "@testing-library/react";
import type { MutableRefObject } from "react";
import { describe, expect, test, vi } from "vitest";

import { assignRef, useMergeRefs } from "./use-merge-refs";

type MockElement = { id: string };

function createRef<T>(): MutableRefObject<T | null> {
	return { current: null };
}

describe(assignRef.name, () => {
	test("should call callback ref with instance", () => {
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef = vi.fn();
		const instance = { value: "test" };

		assignRef(callbackRef, instance);

		expect(callbackRef).toHaveBeenCalledWith(instance);
	});

	test("should assign instance to mutable ref object", () => {
		const objectRef = createRef<{ value: string }>();
		const instance = { value: "test" };

		assignRef(objectRef, instance);

		expect(objectRef.current).toBe(instance);
	});

	test("should handle undefined ref", () => {
		const instance = { value: "test" };

		expect(() => assignRef(undefined, instance)).not.toThrow();
		expect(assignRef(undefined, instance)).toBeUndefined();
	});

	test("should return cleanup function from callback ref", () => {
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const cleanup = vi.fn();
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef = vi.fn(() => cleanup);
		const instance = { value: "test" };

		const result = assignRef(callbackRef, instance);

		expect(result).toBe(cleanup);
	});
});

describe(useMergeRefs.name, () => {
	test("should return null when all refs are null or undefined", () => {
		const { result } = renderHook(() => useMergeRefs(null, undefined));

		expect(result.current).toBeNull();
	});

	test("should merge callback refs", () => {
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef1 = vi.fn();
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef2 = vi.fn();

		const { result } = renderHook(() => useMergeRefs(callbackRef1, callbackRef2));

		const instance: MockElement = { id: "test" };
		result.current?.(instance);

		expect(callbackRef1).toHaveBeenCalledWith(instance);
		expect(callbackRef2).toHaveBeenCalledWith(instance);
	});

	test("should merge object refs", () => {
		const objectRef1 = createRef<MockElement>();
		const objectRef2 = createRef<MockElement>();

		const { result } = renderHook(() => useMergeRefs(objectRef1, objectRef2));

		const instance: MockElement = { id: "test" };
		result.current?.(instance);

		expect(objectRef1.current).toBe(instance);
		expect(objectRef2.current).toBe(instance);
	});

	test("should merge mixed refs", () => {
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef = vi.fn();
		const objectRef = createRef<MockElement>();

		const { result } = renderHook(() => useMergeRefs(callbackRef, objectRef));

		const instance: MockElement = { id: "test" };
		result.current?.(instance);

		expect(callbackRef).toHaveBeenCalledWith(instance);
		expect(objectRef.current).toBe(instance);
	});

	test("should call cleanup functions on unmount", () => {
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const cleanup = vi.fn();
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef = vi.fn(() => cleanup);
		const objectRef = createRef<MockElement>();

		const { result } = renderHook(() => useMergeRefs(callbackRef, objectRef));

		const instance: MockElement = { id: "test" };
		result.current?.(instance);

		// Simulate unmount by calling with null
		result.current?.(null);

		expect(cleanup).toHaveBeenCalled();
		expect(objectRef.current).toBeNull();
	});

	test("should handle ref cleanup when instance changes", () => {
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const cleanup = vi.fn();
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef = vi.fn(() => cleanup);

		const { result } = renderHook(() => useMergeRefs(callbackRef));

		const instance1: MockElement = { id: "first" };
		const instance2: MockElement = { id: "second" };

		result.current?.(instance1);
		expect(callbackRef).toHaveBeenCalledWith(instance1);

		result.current?.(instance2);
		expect(cleanup).toHaveBeenCalled();
		expect(callbackRef).toHaveBeenCalledWith(instance2);
	});

	test("should maintain referential stability", () => {
		// oxlint-disable-next-line vitest/require-mock-type-parameters
		const callbackRef = vi.fn();

		const { result, rerender } = renderHook(() => useMergeRefs(callbackRef));

		const firstResult = result.current;
		rerender();

		expect(result.current).toBe(firstResult);
	});
});
