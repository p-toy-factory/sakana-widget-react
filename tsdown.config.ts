import { defineConfig } from "tsdown";

export default defineConfig({
	format: "esm",
	entry: "src/index.tsx",
	dts: true,
	exports: true,
	platform: "neutral",
	// The published JavaScript bundle is a React client boundary.
	banner: { js: '"use client";' },
});
