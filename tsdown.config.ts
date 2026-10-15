import { defineConfig } from "tsdown";

export default defineConfig({
	format: "esm",
	entry: ["src/index.tsx", "src/core.tsx"],
	dts: true,
	exports: true,
	platform: "neutral",
});
