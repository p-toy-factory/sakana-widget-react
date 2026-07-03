import { defineConfig } from "tsdown";

export default defineConfig({
	format: "esm",
	entry: "src/index.tsx",
	dts: true,
	exports: true,
	platform: "browser",
});
