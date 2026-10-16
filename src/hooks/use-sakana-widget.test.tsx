import { act, render } from "@testing-library/react";
import { Component as ReactComponent, type PropsWithChildren, type Ref } from "react";
import { expect, test, vi } from "vitest";
import { useSakanaWidget } from "./use-sakana-widget";

function createTestComponent<
	Widget extends {
		mount(host: HTMLElement): void;
		unmount(): void;
		setState(): void;
	},
>(loadWidget: () => Promise<new () => Widget>) {
	return function TestWidget({
		widgetRef,
	}: {
		widgetRef?: Ref<Omit<Widget, "mount" | "unmount">>;
	}) {
		const ref = useSakanaWidget(loadWidget, undefined, false, widgetRef);
		return <div ref={ref} />;
	};
}

test("does not construct a widget when its import resolves after unmount", async () => {
	class Widget {
		static constructed = vi.fn<() => void>();
		constructor() {
			Widget.constructed();
		}
		mount() {}
		unmount() {}
		setState() {}
	}
	let resolve!: (value: typeof Widget) => void;
	const loading = new Promise<typeof Widget>((done) => {
		resolve = done;
	});
	const Component = createTestComponent(() => loading);
	const { unmount } = render(<Component />);
	unmount();
	await act(async () => {
		resolve(Widget);
		await loading;
	});
	expect(Widget.constructed).not.toHaveBeenCalled();
});

test("reports a rejected upstream import to the React error boundary", async () => {
	class Boundary extends ReactComponent<PropsWithChildren, { failed: boolean }> {
		override state = { failed: false };
		static getDerivedStateFromError() {
			return { failed: true };
		}
		override render() {
			return this.state.failed ? <div role="alert">Widget failed</div> : this.props.children;
		}
	}
	const failure = new Error("Upstream import failed");
	const Component = createTestComponent(() => Promise.reject(failure));
	const onCaughtError = vi.fn<() => void>();
	const { findByRole, unmount } = render(
		<Boundary>
			<Component />
		</Boundary>,
		{ onCaughtError },
	);
	expect((await findByRole("alert")).textContent).toBe("Widget failed");
	expect(onCaughtError).toHaveBeenCalledOnce();
	unmount();
});

test.each([true, false])(
	"cleans up when a callback ref unmounts synchronously (returns cleanup: %s)",
	async (returnsCleanup) => {
		const cleanup = vi.fn<() => void>();
		const unmounted = vi.fn<() => void>();
		const cleared = vi.fn<() => void>();
		class Widget {
			node = document.createElement("div");
			mount(host: HTMLElement) {
				host.appendChild(this.node);
			}
			unmount() {
				unmounted();
				this.node.remove();
			}
			setState() {}
		}
		const Component = createTestComponent(() => Promise.resolve(Widget));
		// This callback is created by the test, outside React rendering.
		// oxlint-disable-next-line react-perf/jsx-no-new-function-as-prop
		const configureWidget = (instance: Omit<Widget, "mount" | "unmount"> | null) => {
			if (!instance) {
				cleared();
				return;
			}
			unmount();
			return returnsCleanup ? cleanup : undefined;
		};
		const { unmount } = render(<Component widgetRef={configureWidget} />);
		await act(async () => {
			await Promise.resolve();
		});
		expect(unmounted).toHaveBeenCalledOnce();
		expect(cleanup).toHaveBeenCalledTimes(returnsCleanup ? 1 : 0);
		expect(cleared).toHaveBeenCalledTimes(returnsCleanup ? 0 : 1);
	},
);
