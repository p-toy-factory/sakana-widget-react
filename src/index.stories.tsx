import "sakana-widget/lib/index.css";

import type { ArgTypes, Meta } from "@storybook/react";

import { SakanaWidget, SakanaWidgetProps } from ".";

const meta: Meta = {
	title: "SakanaWidget",
	component: SakanaWidget,
	argTypes: {
		autoFit: {
			type: "boolean",
			defaultValue: false,
			description: "auto fit size (120px minimum), default to `false`",
		},
		character: {
			control: { type: "select" },
			options: ["chisato", "takina"],
			defaultValue: "chisato",
			description: "default character, default to `chisato`",
		},
		controls: {
			type: "boolean",
			defaultValue: true,
			description: "controls bar, default to `true`",
		},
		draggable: {
			type: "boolean",
			defaultValue: true,
			description: "character draggable, default to `true`",
		},
		rod: {
			type: "boolean",
			defaultValue: true,
			description: "show spring rod, default to `true`",
		},
		rotate: {
			type: "number",
			defaultValue: 0,
			description: "rotate origin, default to `0`",
		},
		size: {
			type: "number",
			defaultValue: 200,
			description: "widget size, default to `200`",
		},
		threshold: {
			type: "number",
			defaultValue: 0.1,
			description: "motion stop threshold, default to `0.1`",
		},
		title: {
			type: "boolean",
			defaultValue: false,
			description: "enable accessibility title feature, default to `false`",
		},
	} satisfies Partial<ArgTypes<SakanaWidgetProps["options"]>>,
};

export default meta;

const primaryOptions: SakanaWidgetProps["options"] = {
	character: "chisato",
	controls: true,
	draggable: true,
	rod: true,
	title: true,
};

export const Primary = {
	args: {
		style: {
			display: "grid",
			height: 400,
			placeContent: "center",
		},
		...primaryOptions,
	},
	render: ({
		options,
		style,
		...storybookControlsOptions
	}: SakanaWidgetProps) => (
		<SakanaWidget
			options={{
				...options,
				...(storybookControlsOptions as SakanaWidgetProps["options"]),
			}}
			style={style}
		/>
	),
};
