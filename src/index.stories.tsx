import "sakana-widget/lib/index.css";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { SakanaWidgetOptions } from "sakana-widget";

import { SakanaWidget, type SakanaWidgetProps } from ".";

function toWidgetProps({
	autoFit,
	character,
	controls,
	draggable,
	rod,
	rotate,
	size,
	stroke,
	threshold,
	title,
	...props
}: SakanaWidgetProps & SakanaWidgetOptions): SakanaWidgetProps {
	return {
		...props,
		options: Object.fromEntries(
			Object.entries({
				autoFit,
				character,
				controls,
				draggable,
				rod,
				rotate,
				size,
				stroke,
				threshold,
				title,
			}).filter(([, v]) => v !== undefined),
		) as SakanaWidgetOptions,
	};
}

const meta: Meta = {
	title: "SakanaWidget",
	component: SakanaWidget,
	argTypes: {
		disableBounceOnMount: {
			control: "boolean",
			defaultValue: false,
			description: "default to `false`",
		},
		autoFit: {
			defaultValue: false,
			control: "boolean",
			description: "auto fit size (120px minimum), default to `false`",
		},
		character: {
			control: "select",
			options: ["chisato", "takina"],
			defaultValue: "chisato",
			description: "default character, default to `chisato`",
		},
		controls: {
			defaultValue: true,
			control: "boolean",
			description: "controls bar, default to `true`",
		},
		draggable: {
			defaultValue: true,
			control: "boolean",
			description: "character draggable, default to `true`",
		},
		rod: {
			defaultValue: true,
			control: "boolean",
			description: "show spring rod, default to `true`",
		},
		rotate: {
			defaultValue: 0,
			control: "number",
			description: "rotate origin, default to `0`",
		},
		size: {
			defaultValue: 200,
			control: "number",
			description: "widget size, default to `200`",
		},
		threshold: {
			defaultValue: 0.1,
			control: "number",
			description: "motion stop threshold, default to `0.1`",
		},
		title: {
			defaultValue: false,
			control: "boolean",
			description: "enable accessibility title feature, default to `false`",
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		style: {
			display: "grid",
			height: 300,
			width: 300,
			placeContent: "center",
		},
		character: "chisato",
		controls: true,
		draggable: true,
		rod: true,
		title: true,
	},
	render: (args) => <SakanaWidget {...toWidgetProps(args)} />,
};

export const DisableBounceOnMount: Story = {
	args: {
		disableBounceOnMount: true,
	},
};

export const TestAvoidUnmountOnPropsChanges: Story = {
	args: {
		character: "chisato",
		controls: true,
		draggable: true,
		rod: true,
		title: true,
	},
	render: (args) => {
		const [count, setCount] = useState(0);
		return (
			<div>
				<p>
					Count: {count}{" "}
					<button type="button" onClick={() => setCount((prev) => prev + 1)}>
						+1
					</button>
				</p>
				<SakanaWidget {...toWidgetProps(args)} />
			</div>
		);
	},
};
