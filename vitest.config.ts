import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "node",
					include: ["./src/**/*.test.{ts,tsx}"],
					exclude: ["./src/**/*.browser.test.{ts,tsx}"],
				},
			},
			{
				plugins: [react()],
				test: {
					name: "browser",
					include: ["./src/**/*.browser.test.{ts,tsx}"],
					browser: {
						viewport: { width: 300, height: 300 },
						enabled: true,
						provider: playwright(),
						// https://vitest.dev/config/browser/playwright
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
