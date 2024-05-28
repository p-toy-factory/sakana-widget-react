import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.tsx"],
	dts: true,
	exports: true,
	sourcemap: true,
	platform: "neutral",
});
