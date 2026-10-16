import { createRef } from "react";
import UpstreamSakanaWidget from "sakana-widget/core";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { SakanaWidget, SakanaWidgetReact, type SakanaWidgetApi } from "./core";

// Browser test files run in isolated frames. Do not import the default entry here:
// this must exercise core before any bundled characters have been registered.
test("core renders an explicitly registered character without bundled defaults", async () => {
	expect(UpstreamSakanaWidget.getCharacters()).toEqual({});
	expect(SakanaWidgetReact).toBe(SakanaWidget);
	const image =
		"data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2220%22%20height=%2220%22/%3E";
	UpstreamSakanaWidget.registerCharacter("custom-core", {
		image,
		initialState: { i: 0.02, s: 0.1, d: 0.98, r: 20, y: 10, t: 50, w: 70 },
	});
	const hostRef = createRef<HTMLDivElement>();
	const widgetRef = createRef<SakanaWidgetApi>();
	const { container, unmount } = await render(
		<SakanaWidget
			ref={hostRef}
			widgetRef={widgetRef}
			disableBounceOnMount
			options={{ character: "custom-core", imageFit: "contain" }}
		/>,
	);

	await expect.poll(() => widgetRef.current).not.toBeNull();

	expect(Object.keys(UpstreamSakanaWidget.getCharacters())).toEqual(["custom-core"]);
	expect(hostRef.current?.querySelector(".sakana-widget-wrapper")?.parentElement).toBe(
		hostRef.current?.firstElementChild,
	);
	expect(widgetRef.current).toBeInstanceOf(UpstreamSakanaWidget);
	const character = container.querySelector<HTMLDivElement>(".sakana-widget-img")!;
	expect(character.style.backgroundImage).toContain("data:image/svg+xml");
	expect(character.style.backgroundSize).toBe("contain");
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	expect(character.style.transform).toBe("rotate(0deg) translateX(0px) translateY(0px)");

	await unmount();

	expect(hostRef.current).toBeNull();
	expect(widgetRef.current).toBeNull();
	expect(container.innerHTML).toBe("");
});
