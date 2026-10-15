// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SakanaWidget } from "./index";
import { SakanaWidget as SakanaWidgetCore } from "./core";

describe("server rendering", () => {
	test.each([SakanaWidget, SakanaWidgetCore])(
		"renders the host without loading upstream DOM code",
		(Widget) => {
			expect(typeof window).toBe("undefined");
			expect(renderToString(<Widget id="ssr-widget" />)).toBe('<div id="ssr-widget"></div>');
		},
	);
});
