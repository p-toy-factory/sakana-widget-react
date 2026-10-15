import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useState } from "react";
import SakanaWidgetClass from "sakana-widget/core";
import takina from "sakana-widget/characters/takina";
import type { SakanaWidgetOptions } from "sakana-widget";

import { SakanaWidget, type SakanaWidgetApi, type SakanaWidgetProps } from ".";
import { SakanaWidget as SakanaWidgetCore } from "./core";

SakanaWidgetClass.registerCharacter("takina", takina);

function toWidgetProps({
	autoFit,
	character,
	controls,
	draggable,
	imageFit,
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
				imageFit,
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
	render: (args) => <SakanaWidget {...toWidgetProps(args)} />,
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
		imageFit: {
			control: "select",
			options: ["cover", "contain"],
			description: "image fit in the square image area, default to `cover`",
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
		rotate: 30,
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

export const ImageFit: Story = {
	args: {
		imageFit: "contain",
	},
};

export const CoreWithSelectedCharacter: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Import the React component from sakana-widget-react/core and register Takina using sakana-widget/core before rendering. This Storybook also loads the default entry for other stories; a standalone core bundle can omit the other built-in image.",
			},
		},
	},
	render: () => <SakanaWidgetCore options={{ character: "takina" }} />,
};

function CustomControlsExample() {
	const [bounces, setBounces] = useState(0);
	const configureWidget = useCallback((widget: SakanaWidgetApi | null) => {
		if (!widget) return;
		const icon = document.createElement("span");
		icon.textContent = "↻";
		widget.addControl({
			id: "bounce",
			label: "Bounce",
			icon,
			onClick: () => {
				widget.setState({ r: 1, y: 0.2 });
				setBounces((count) => count + 1);
			},
		});
		return () => {
			widget.removeControl("bounce");
		};
	}, []);

	return (
		<div>
			<p>Custom control clicks: {bounces}</p>
			<SakanaWidget widgetRef={configureWidget} options={{ title: true }} />
		</div>
	);
}

export const CustomControls: Story = {
	render: () => <CustomControlsExample />,
};
