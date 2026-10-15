import type { PropsWithChildren, ReactNode } from "react";
import { createRef, StrictMode } from "react";
import type UpstreamSakanaWidget from "sakana-widget/core";
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

function render(ui: ReactNode, options?: ComponentRenderOptions) {
	return baseRender(ui, { wrapper: Wrapper, ...options });
}

describe("SakanaWidget", () => {
	test("unmount cleanup - widget DOM removed from container", async () => {
		const { container, unmount } = await render(<SakanaWidget />);

		expect(container.innerHTML).not.toBe("");

		await unmount();

		expect(container.innerHTML).toBe("");
	});

	test("unmount cleanup - detached containers still release the upstream instance", async () => {
		const widgetRef = createRef<SakanaWidgetApi>();
		const { container, unmount } = await render(<SakanaWidget widgetRef={widgetRef} />);
		const unmountInstance = vi.spyOn(widgetRef.current as UpstreamSakanaWidget, "unmount");
		container.remove();
		expect(container.isConnected).toBe(false);

		await unmount();

		expect(unmountInstance).toHaveBeenCalledOnce();
		expect(widgetRef.current).toBeNull();
	});

	test("unmount cleanup - a widget hidden by Close still releases the upstream instance", async () => {
		const widgetRef = createRef<SakanaWidgetApi>();
		const stateKey = "sakana-widget-react-cleanup-test";
		localStorage.removeItem(stateKey);
		try {
			const { container, unmount } = await render(
				<SakanaWidget widgetRef={widgetRef} options={{ title: true, saveState: true, stateKey }} />,
			);
			const unmountInstance = vi.spyOn(widgetRef.current as UpstreamSakanaWidget, "unmount");

			await page.getByTitle("Close", { exact: true }).click();
			expect(container.querySelector<HTMLDivElement>(".sakana-widget-wrapper")?.style.display).toBe(
				"none",
			);

			await unmount();

			expect(unmountInstance).toHaveBeenCalledOnce();
			expect(widgetRef.current).toBeNull();
		} finally {
			localStorage.removeItem(stateKey);
		}
	});

	test.each(["options", "disableBounceOnMount"] as const)(
		"cleanup after Close - %s changes keep the React tree mounted",
		async (changedProp) => {
			const widgetRef = createRef<SakanaWidgetApi>();
			const { container, rerender, unmount } = await render(
				<>
					<p>Page content</p>
					<SakanaWidget widgetRef={widgetRef} options={{ title: true, draggable: true }} />
				</>,
			);
			const firstInstance = widgetRef.current;

			await page.getByTitle("Close", { exact: true }).click();
			expect(container.querySelector(".sakana-widget-wrapper")).toBeNull();

			await rerender(
				<>
					<p>Page content</p>
					<SakanaWidget
						widgetRef={widgetRef}
						disableBounceOnMount={changedProp === "disableBounceOnMount"}
						options={{ title: true, draggable: changedProp !== "options" }}
					/>
				</>,
			);

			expect(container.querySelector("p")?.textContent).toBe("Page content");
			expect(container.querySelector(".sakana-widget-wrapper")).not.toBeNull();
			expect(widgetRef.current).toBeTruthy();
			expect(widgetRef.current).not.toBe(firstInstance);

			await page.getByTitle("Close", { exact: true }).click();
			await unmount();
			expect(container.innerHTML).toBe("");
			expect(widgetRef.current).toBeNull();
		},
	);

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

	test("keeps the forwarded host when replacing the widget", async () => {
		const hostRef = createRef<HTMLDivElement>();
		const widgetRef = createRef<SakanaWidgetApi>();
		const { rerender, unmount } = await render(
			<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 200 }} />,
		);
		const host = hostRef.current!;
		const widgetNode = host.querySelector(".sakana-widget-wrapper")!;
		expect(widgetNode.parentElement).toBe(host);

		await rerender(<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 250 }} />);

		expect(hostRef.current).toBe(host);
		expect(widgetNode.parentElement).toBeNull();
		expect(host.querySelectorAll(".sakana-widget-wrapper")).toHaveLength(1);
		expect(host.querySelector(".sakana-widget-wrapper")?.parentElement).toBe(host);
		await unmount();
		expect(hostRef.current).toBeNull();
		expect(widgetRef.current).toBeNull();
	});

	test("autoFit follows the host dimensions and subsequent resizing", async () => {
		const widgetRef = createRef<SakanaWidgetApi>();
		const { container, rerender } = await render(
			<SakanaWidget
				widgetRef={widgetRef}
				options={{ autoFit: true }}
				style={{ width: 300, height: 300 }}
			/>,
		);
		const instance = widgetRef.current;
		const app = container.querySelector<HTMLDivElement>(".sakana-widget-app")!;
		await expect.poll(() => app.style.width).toBe("300px");
		expect(app.style.height).toBe("300px");

		await rerender(
			<SakanaWidget
				widgetRef={widgetRef}
				options={{ autoFit: true }}
				style={{ width: 420, height: 360 }}
			/>,
		);
		await expect.poll(() => app.style.width).toBe("360px");
		expect(app.style.height).toBe("360px");
		expect(widgetRef.current).toBe(instance);
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
