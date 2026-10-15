import { cleanup, render } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import type WidgetClass from "sakana-widget/core";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { SakanaWidgetApi, SakanaWidgetProps } from "./core";

beforeEach(() => {
	vi.resetModules();
});

afterEach(() => {
	cleanup();
	vi.doUnmock("sakana-widget/core");
});

function mockWidget(onConstruct = () => {}) {
	class Widget {
		static registerCharacter = vi.fn<typeof WidgetClass.registerCharacter>();
		static constructed = vi.fn<() => void>();
		static unmounted = vi.fn<() => void>();
		node = document.createElement("div");
		_domApp = this.node;
		constructor() {
			onConstruct();
			Widget.constructed();
		}
		mount(host: HTMLElement) {
			host.appendChild(this.node);
		}
		unmount() {
			Widget.unmounted();
			this.node.remove();
		}
		setState() {}
	}
	vi.doMock("sakana-widget/core", () => ({ default: Widget }));
	return Widget;
}

const initialOptions = { size: 200 };
const nextOptions = { size: 300 };

test("registers built-in characters once across StrictMode, updates and remounts", async () => {
	const Widget = mockWidget(() => {
		expect(Widget.registerCharacter).toHaveBeenCalledTimes(2);
	});
	const { SakanaWidget } = await import("./index");
	const { default: chisato } = await import("sakana-widget/characters/chisato");
	const { default: takina } = await import("sakana-widget/characters/takina");
	const { rerender, unmount } = render(
		<StrictMode>
			<SakanaWidget options={initialOptions} />
		</StrictMode>,
	);
	rerender(
		<StrictMode>
			<SakanaWidget options={nextOptions} />
		</StrictMode>,
	);
	unmount();
	render(<SakanaWidget />);

	expect(Widget.registerCharacter).toHaveBeenCalledTimes(2);
	expect(Widget.registerCharacter).toHaveBeenNthCalledWith(1, "chisato", chisato);
	expect(Widget.registerCharacter).toHaveBeenNthCalledWith(2, "takina", takina);
	expect(Widget.constructed.mock.calls.length).toBeGreaterThan(2);
});

test("core runs the initializer before construction and recreates on initializer changes", async () => {
	const events: string[] = [];
	const Widget = mockWidget(() => events.push("construct"));
	const { SakanaWidget } = await import("./core");
	const firstInitializer = vi.fn<NonNullable<SakanaWidgetProps["initializer"]>>(() => {
		events.push("first");
	});
	const nextInitializer = vi.fn<NonNullable<SakanaWidgetProps["initializer"]>>(() => {
		events.push("next");
	});
	const widgetRef = createRef<SakanaWidgetApi>();
	const { rerender } = render(
		<SakanaWidget initializer={firstInitializer} widgetRef={widgetRef} />,
	);
	const firstInstance = widgetRef.current;
	expect(firstInstance).toBeTruthy();
	const initialEvents = [...events];
	expect(initialEvents.length).toBeGreaterThan(0);
	expect(initialEvents).toEqual(
		Array.from({ length: initialEvents.length / 2 }, () => ["first", "construct"]).flat(),
	);
	expect(firstInitializer).toHaveBeenCalledWith(Widget);

	rerender(<SakanaWidget initializer={firstInitializer} widgetRef={widgetRef} />);
	expect(widgetRef.current).toBe(firstInstance);
	expect(events).toEqual(initialEvents);
	const previousUnmounts = Widget.unmounted.mock.calls.length;

	rerender(<SakanaWidget initializer={nextInitializer} widgetRef={widgetRef} />);
	expect(events).toEqual([...initialEvents, "next", "construct"]);
	expect(nextInitializer).toHaveBeenCalledWith(Widget);
	expect(widgetRef.current).not.toBe(firstInstance);
	expect(Widget.unmounted).toHaveBeenCalledTimes(previousUnmounts + 1);
	expect(Widget.registerCharacter).not.toHaveBeenCalled();
});

test.each([true, false])(
	"cleans up callback refs on unmount (returns cleanup: %s)",
	async (returnsCleanup) => {
		const Widget = mockWidget();
		const { SakanaWidget } = await import("./core");
		const refCleanup = vi.fn<() => void>();
		const widgetRef = vi.fn<(instance: SakanaWidgetApi | null) => (() => void) | undefined>(
			(instance) => (instance && returnsCleanup ? refCleanup : undefined),
		);
		const hostRef = createRef<HTMLDivElement>();
		const { unmount } = render(<SakanaWidget ref={hostRef} widgetRef={widgetRef} />);
		const host = hostRef.current!;
		expect(host.childElementCount).toBe(1);
		expect(widgetRef).toHaveBeenLastCalledWith(expect.anything());
		Widget.unmounted.mockClear();
		refCleanup.mockClear();
		widgetRef.mockClear();

		unmount();

		expect(Widget.unmounted).toHaveBeenCalledOnce();
		expect(host.childElementCount).toBe(0);
		expect(hostRef.current).toBeNull();
		expect(refCleanup).toHaveBeenCalledTimes(returnsCleanup ? 1 : 0);
		expect(widgetRef.mock.calls.map(([instance]) => instance === null)).toEqual(
			returnsCleanup ? [] : [true],
		);
	},
);
