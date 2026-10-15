import { act, render } from "@testing-library/react";
import { Component as ReactComponent, type PropsWithChildren } from "react";
import { expect, test, vi } from "vitest";
import { createSakanaWidgetComponent } from "./create-sakana-widget-component";

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
	const Component = createSakanaWidgetComponent(() => loading);
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
	const Component = createSakanaWidgetComponent(() => Promise.reject(failure));
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
