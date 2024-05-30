export const isBrowser = typeof window !== "undefined";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function isFunction(value: unknown): value is Function {
	return typeof value === "function";
}
