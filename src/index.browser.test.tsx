import "sakana-widget/lib/index.css";

import type { ReactNode } from "react";
import { useRef } from "react";
import type SakanaWidgetClass from "sakana-widget";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import {
	type ComponentRenderOptions,
	render as baseRender,
} from "vitest-browser-react";

import { SakanaWidget } from "./index";

function Wrapper({ children }: { children: ReactNode }) {
	return (
		<div
			style={{
				display: "grid",
				height: 300,
				width: 300,
				placeContent: "center",
			}}
		>
			{children}
		</div>
	);
}

function render(ui: ReactNode, options?: ComponentRenderOptions) {
	return baseRender(ui, { wrapper: Wrapper, ...options });
}

describe("SakanaWidget", () => {
	test("unmount cleanup — widget DOM removed from container", async () => {
		const { container, unmount } = await render(<SakanaWidget />);

		expect(container.innerHTML).not.toBe("");

		await unmount();

		expect(container.innerHTML).toBe("");
	});

	test("double-unmount protection — no error when widget already unmounted externally", async () => {
		let instance: SakanaWidgetClass | null = null;

		function Widget() {
			const ref = useRef<SakanaWidgetClass>(null);
			instance = ref.current;
			return <SakanaWidget widgetRef={ref} />;
		}

		const { unmount, rerender } = await render(<Widget />);
		// After first render, ref is not yet assigned; rerender to capture it
		await rerender(<Widget />);

		expect(instance).toBeTruthy();
		instance!.unmount();

		expect(() => unmount()).not.toThrow();
	});

	test("re-instantiation on structural change — new instance when options change", async () => {
		let instance: SakanaWidgetClass | null = null;

		function Widget({ size }: { size: number }) {
			const ref = useRef<SakanaWidgetClass>(null);
			instance = ref.current;
			return <SakanaWidget widgetRef={ref} options={{ size }} />;
		}

		const { rerender } = await render(<Widget size={200} />);
		await rerender(<Widget size={200} />);
		const firstInstance = instance;
		expect(firstInstance).toBeTruthy();

		await rerender(<Widget size={300} />);
		await rerender(<Widget size={300} />);

		expect(instance).toBeTruthy();
		expect(instance).not.toBe(firstInstance);
	});

	test("no re-instantiation on referential change — same instance for structurally equal options", async () => {
		let instance: SakanaWidgetClass | null = null;

		function Widget({ size }: { size: number }) {
			const ref = useRef<SakanaWidgetClass>(null);
			instance = ref.current;
			return <SakanaWidget widgetRef={ref} options={{ size }} />;
		}

		const { rerender } = await render(<Widget size={200} />);
		await rerender(<Widget size={200} />);
		const firstInstance = instance;
		expect(firstInstance).toBeTruthy();

		await rerender(<Widget size={200} />);
		await rerender(<Widget size={200} />);

		expect(instance).toBe(firstInstance);
	});

	test("div attribute passthrough — extra HTML attributes forwarded to container div", async () => {
		const { container } = await render(
			<SakanaWidget
				style={{ position: "fixed" }}
				data-testid="sakana"
				id="widget-1"
			/>,
		);

		const div = container.querySelector(
			"[data-testid='sakana']",
		) as HTMLDivElement;
		expect(div.style.position).toBe("fixed");
		expect(div.dataset.testid).toBe("sakana");
		expect(div.id).toBe("widget-1");
	});

	describe.skip("visual regression", () => {
		test("default rendering — chisato character", async () => {
			await render(
				<SakanaWidget disableBounceOnMount data-testid="sakana-widget" />,
			);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot(
				"default-chisato",
			);
		});

		test("takina character", async () => {
			await render(
				<SakanaWidget
					disableBounceOnMount
					data-testid="sakana-widget"
					options={{ character: "takina" }}
				/>,
			);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot(
				"takina",
			);
		});

		test("custom size", async () => {
			await render(
				<SakanaWidget
					disableBounceOnMount
					data-testid="sakana-widget"
					options={{ size: 100 }}
				/>,
			);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot(
				"custom-size-100",
			);
		});

		test("controls hidden", async () => {
			await render(
				<SakanaWidget
					disableBounceOnMount
					data-testid="sakana-widget"
					options={{ controls: false }}
				/>,
			);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot(
				"controls-hidden",
			);
		});
	});
});
