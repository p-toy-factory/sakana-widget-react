import type { PropsWithChildren, ReactNode } from "react";
import { createRef, StrictMode } from "react";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { type ComponentRenderOptions, render as baseRender } from "vitest-browser-react";

import { SakanaWidget, type SakanaWidgetApi } from "./index";

function Wrapper({ children }: PropsWithChildren) {
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

async function render(ui: ReactNode, options?: ComponentRenderOptions) {
	const result = await baseRender(ui, { wrapper: Wrapper, ...options });
	const waitForWidget = async () => {
		await expect
			.poll(() => result.container.querySelector(".sakana-widget-wrapper"))
			.not.toBeNull();
	};
	await waitForWidget();
	return {
		...result,
		async rerender(nextUi: ReactNode) {
			await result.rerender(nextUi);
			await waitForWidget();
		},
	};
}

describe("SakanaWidget", () => {
	test("unmount cleanup - widget DOM removed from container", async () => {
		const { container, unmount } = await render(<SakanaWidget />);

		expect(container.innerHTML).not.toBe("");

		await unmount();

		expect(container.innerHTML).toBe("");
	});

	test("re-instantiation on structural change - new instance when options change", async () => {
		const widgetRef = createRef<SakanaWidgetApi>();
		const { rerender } = await render(
			<SakanaWidget widgetRef={widgetRef} options={{ size: 200 }} />,
		);
		const firstInstance = widgetRef.current;
		expect(firstInstance).toBeTruthy();

		await rerender(<SakanaWidget widgetRef={widgetRef} options={{ size: 300 }} />);

		expect(widgetRef.current).toBeTruthy();
		expect(widgetRef.current).not.toBe(firstInstance);
	});

	test("structurally equal nested options preserve the instance", async () => {
		const widgetRef = createRef<SakanaWidgetApi>();
		const options = { size: 200, stroke: { color: "red", width: 4 } };
		const { rerender } = await render(<SakanaWidget widgetRef={widgetRef} options={options} />);
		const firstInstance = widgetRef.current;
		expect(firstInstance).toBeTruthy();

		await rerender(
			<SakanaWidget
				widgetRef={widgetRef}
				options={{ size: 200, stroke: { color: "red", width: 4 } }}
			/>,
		);

		expect(widgetRef.current).toBe(firstInstance);
	});

	test("keeps the forwarded host and delegates DOM to an internal container", async () => {
		const hostRef = createRef<HTMLDivElement>();
		const widgetRef = createRef<SakanaWidgetApi>();
		const { rerender, unmount } = await render(
			<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 200 }} />,
		);
		const host = hostRef.current!;
		const inner = host.firstElementChild!;
		const widgetNode = host.querySelector(".sakana-widget-wrapper")!;
		expect(widgetNode.parentElement).toBe(inner);
		expect(inner).not.toBe(host);

		await rerender(<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 250 }} />);

		expect(hostRef.current).toBe(host);
		expect(inner.isConnected).toBe(false);
		expect(widgetNode.parentElement).toBeNull();
		expect(host.querySelectorAll(".sakana-widget-wrapper")).toHaveLength(1);
		expect(host.querySelector(".sakana-widget-wrapper")?.parentElement).toBe(
			host.firstElementChild,
		);
		await unmount();
		expect(hostRef.current).toBeNull();
		expect(widgetRef.current).toBeNull();
	});

	test("StrictMode leaves one working widget and cleans up its refs", async () => {
		const hostRef = createRef<HTMLDivElement>();
		const widgetRef = createRef<SakanaWidgetApi>();
		const { unmount } = await render(
			<StrictMode>
				<SakanaWidget ref={hostRef} widgetRef={widgetRef} />
			</StrictMode>,
		);
		const host = hostRef.current!;
		expect(host.querySelectorAll(".sakana-widget-wrapper")).toHaveLength(1);
		expect(widgetRef.current).toBeTruthy();
		await page.getByRole("button", { name: "Auto Mode" }).click();
		expect(host.querySelector("[aria-label='Auto Mode']")?.getAttribute("aria-pressed")).toBe(
			"true",
		);

		await unmount();

		expect(hostRef.current).toBeNull();
		expect(widgetRef.current).toBeNull();
		expect(host.querySelector(".sakana-widget-wrapper")).toBeNull();
	});

	test("Close followed by React unmount does not unmount upstream twice", async () => {
		const widgetRef = createRef<SakanaWidgetApi>();
		const { container, unmount } = await render(<SakanaWidget widgetRef={widgetRef} />);
		await page.getByRole("button", { name: "Close" }).click();
		expect(container.querySelector(".sakana-widget-wrapper")).toBeNull();

		await unmount();

		expect(widgetRef.current).toBeNull();
		expect(container.innerHTML).toBe("");
	});

	test("option changes recreate a closed widget while retaining its host", async () => {
		const hostRef = createRef<HTMLDivElement>();
		const widgetRef = createRef<SakanaWidgetApi>();
		const { rerender } = await render(
			<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 200 }} />,
		);
		const host = hostRef.current!;
		const instance = widgetRef.current;
		await page.getByRole("button", { name: "Close" }).click();

		await rerender(<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 250 }} />);

		expect(hostRef.current).toBe(host);
		expect(widgetRef.current).not.toBe(instance);
		expect(host.querySelectorAll(".sakana-widget-wrapper")).toHaveLength(1);
		expect(host.querySelector(".sakana-widget-app")?.getAttribute("style")).toContain("250px");
	});

	test.each([
		{ options: {}, equilibrium: 0 },
		{ options: { rotate: 40 }, equilibrium: -20 },
		{ options: { rotate: -40 }, equilibrium: 0 },
		{ options: { rotate: 160 }, equilibrium: -60 },
	])("disableBounceOnMount stays still with $options", async ({ options, equilibrium }) => {
		const widgetRef = createRef<SakanaWidgetApi>();
		const { container } = await render(
			<SakanaWidget widgetRef={widgetRef} disableBounceOnMount options={options} />,
		);
		const image = container.querySelector<HTMLDivElement>(".sakana-widget-img")!;
		const transform = `rotate(${equilibrium}deg) translateX(${equilibrium}px) translateY(0px)`;
		expect(image.style.transform).toBe(transform);

		for (let frame = 0; frame < 4; frame += 1) {
			// Check successive frames so an initially stable widget cannot hide later motion.
			// oxlint-disable-next-line no-await-in-loop
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			expect(image.style.transform).toBe(transform);
		}
		// Invalid physics can leave the last valid CSS transform in place.
		const diagnostics = widgetRef.current as unknown as {
			_state: Record<string, number>;
			_running: boolean;
		};
		expect(Object.values(diagnostics._state).every(Number.isFinite)).toBe(true);
		expect(diagnostics._running).toBe(false);
	});

	test("imageFit is applied and updates through options", async () => {
		const { container, rerender } = await render(
			<SakanaWidget options={{ imageFit: "contain" }} />,
		);
		expect(getComputedStyle(container.querySelector(".sakana-widget-img")!).backgroundSize).toBe(
			"contain",
		);

		await rerender(<SakanaWidget options={{ imageFit: "cover" }} />);

		expect(getComputedStyle(container.querySelector(".sakana-widget-img")!).backgroundSize).toBe(
			"cover",
		);
	});

	test("custom controls added through widgetRef receive clicks and can be removed", async () => {
		const widgetRef = createRef<SakanaWidgetApi>();
		await render(<SakanaWidget widgetRef={widgetRef} />);
		const onClick = vi.fn<(widget: SakanaWidgetApi, event: MouseEvent) => void>();
		const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		widgetRef.current!.addControl({ id: "test-control", label: "Test control", icon, onClick });
		const button = document.querySelector<HTMLButtonElement>(
			"[data-sakana-control='test-control']",
		)!;
		expect(button.querySelector("svg")).not.toBe(icon);

		await page.getByRole("button", { name: "Test control" }).click();

		expect(onClick).toHaveBeenCalledOnce();
		expect(onClick.mock.calls[0]?.[0]).toBe(widgetRef.current);
		expect(onClick.mock.calls[0]?.[1]).toBeInstanceOf(MouseEvent);
		widgetRef.current!.removeControl("test-control");
		expect(button.isConnected).toBe(false);
		button.click();
		expect(onClick).toHaveBeenCalledOnce();
	});

	test("div attribute passthrough - extra HTML attributes forwarded to container div", async () => {
		const { container } = await render(
			<SakanaWidget style={{ position: "fixed" }} data-testid="sakana" id="widget-1" />,
		);

		const div = container.querySelector("[data-testid='sakana']") as HTMLDivElement;
		expect(div.style.position).toBe("fixed");
		expect(div.dataset.testid).toBe("sakana");
		expect(div.id).toBe("widget-1");
	});

	// oxlint-disable-next-line vitest/no-disabled-tests
	describe.skip("visual regression", () => {
		test("default rendering - chisato character", async () => {
			await render(<SakanaWidget disableBounceOnMount data-testid="sakana-widget" />);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot("default-chisato");
		});

		test("takina character", async () => {
			await render(
				<SakanaWidget
					disableBounceOnMount
					data-testid="sakana-widget"
					options={{ character: "takina" }}
				/>,
			);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot("takina");
		});

		test("custom size", async () => {
			await render(
				<SakanaWidget disableBounceOnMount data-testid="sakana-widget" options={{ size: 100 }} />,
			);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot("custom-size-100");
		});

		test("controls hidden", async () => {
			await render(
				<SakanaWidget
					disableBounceOnMount
					data-testid="sakana-widget"
					options={{ controls: false }}
				/>,
			);

			await expect(page.getByTestId("sakana-widget")).toMatchScreenshot("controls-hidden");
		});
	});
});
