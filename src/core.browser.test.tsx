import { createRef, StrictMode } from "react";
import UpstreamWidget, { type SakanaWidgetCharacter } from "sakana-widget/core";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { SakanaWidget as Core, type SakanaWidgetApi } from "./core";
import { SakanaWidget } from "./index";

const customImage =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=";
const customCharacter: SakanaWidgetCharacter = {
	image: customImage,
	initialState: { i: 0.01, s: 0.1, d: 0.99, r: 0, y: 0, t: 0, w: 0 },
};

function expectCustomImage(host: HTMLDivElement) {
	expect(host.querySelector<HTMLDivElement>(".sakana-widget-img")?.style.backgroundImage).toContain(
		customImage,
	);
}

describe("core entry with the real upstream registry", () => {
	test("initializes a custom character before construction and mounts directly in the forwarded host", async () => {
		const characterName = "react-core-browser-custom";
		const hostRef = createRef<HTMLDivElement>();
		const widgetRef = createRef<SakanaWidgetApi>();
		const initializer = vi.fn<(Widget: typeof UpstreamWidget) => void>((Widget) => {
			expect(Widget).toBe(UpstreamWidget);
			expect(widgetRef.current).toBeNull();
			Widget.registerCharacter(characterName, customCharacter);
		});
		expect(UpstreamWidget.getCharacter(characterName)).toBeNull();

		const { container, unmount } = await render(
			<Core
				ref={hostRef}
				widgetRef={widgetRef}
				initializer={initializer}
				options={{ character: characterName }}
				data-testid="custom-host"
			/>,
		);

		const host = hostRef.current!;
		expect(initializer).toHaveBeenCalledWith(UpstreamWidget);
		expect(widgetRef.current).toBeInstanceOf(UpstreamWidget);
		expect(container.querySelector("[data-testid='custom-host']")).toBe(host);
		expect(host.querySelector(".sakana-widget-wrapper")?.parentElement).toBe(host);
		expectCustomImage(host);

		await unmount();

		expect(hostRef.current).toBeNull();
		expect(widgetRef.current).toBeNull();
		expect(host.querySelector(".sakana-widget-wrapper")).toBeNull();
	});

	test("default initialization preserves later built-in character overrides across mounts and option changes", async () => {
		const initial = await render(<SakanaWidget />);
		const originalCharacter = UpstreamWidget.getCharacter("chisato")!;
		expect(originalCharacter).not.toBeNull();
		await initial.unmount();

		const hostRef = createRef<HTMLDivElement>();
		const widgetRef = createRef<SakanaWidgetApi>();
		let mounted: Awaited<ReturnType<typeof render>> | undefined;
		try {
			UpstreamWidget.registerCharacter("chisato", customCharacter);
			mounted = await render(
				<StrictMode>
					<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 200 }} />
				</StrictMode>,
			);
			expectCustomImage(hostRef.current!);
			const firstInstance = widgetRef.current;

			await mounted.rerender(
				<StrictMode>
					<SakanaWidget ref={hostRef} widgetRef={widgetRef} options={{ size: 250 }} />
				</StrictMode>,
			);
			expect(widgetRef.current).not.toBe(firstInstance);
			expectCustomImage(hostRef.current!);

			await mounted.unmount();
			mounted = await render(<SakanaWidget ref={hostRef} widgetRef={widgetRef} />);
			expectCustomImage(hostRef.current!);
			expect(UpstreamWidget.getCharacter("chisato")).toEqual(customCharacter);
		} finally {
			await mounted?.unmount();
			UpstreamWidget.registerCharacter("chisato", originalCharacter);
		}
	});
});
