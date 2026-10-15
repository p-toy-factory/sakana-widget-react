// @vitest-environment node

import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { SakanaWidget as CoreSakanaWidget, type SakanaWidgetProps } from "./core";
import { SakanaWidget } from "./index";

test("imports both entries without window and renders only their hosts on the server", () => {
	expect(typeof window).toBe("undefined");
	expect(renderToString(<SakanaWidget id="ssr-widget" />)).toBe('<div id="ssr-widget"></div>');
	const initializer = vi.fn<NonNullable<SakanaWidgetProps["initializer"]>>();
	expect(renderToString(<CoreSakanaWidget id="ssr-core" initializer={initializer} />)).toBe(
		'<div id="ssr-core"></div>',
	);
	expect(initializer).not.toHaveBeenCalled();
});
