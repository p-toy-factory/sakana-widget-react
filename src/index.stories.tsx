import "sakana-widget/lib/index.css";

import type { ArgTypes, Meta } from "@storybook/react";
import pick from "object.pick";
import { useLayoutEffect, useRef, useState } from "react";
import type SakanaWidgetClass from "sakana-widget";
import type { SakanaWidgetOptions, SakanaWidgetState } from "sakana-widget";

import { SakanaWidget, type SakanaWidgetProps } from ".";

// TODO: Fix the features and the type errors
const meta: Meta = {
	title: "SakanaWidget",
	component: SakanaWidget,
	argTypes: {
		// #region SakanaWidgetProps
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
		disableBounceOnMount: {
			type: "boolean",
			defaultValue: false,
			description: "default to `false`",
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
		// #endregion

		// #region SakanaWidgetState
		i: {
			type: "number",
			description: "inertia",
		},
		s: {
			type: "number",
			description: "stickiness",
		},
		d: {
			type: "number",
			description: "decay",
		},
		r: {
			type: "number",
			description: "angle",
		},
		y: {
			type: "number",
			description: "height",
		},
		t: {
			type: "number",
			description: "vertical speed",
		},
		w: {
			type: "number",
			description: "horizontal speed",
		},
		// #endregion
	} satisfies Partial<ArgTypes<SakanaWidgetOptions & SakanaWidgetState>>,
};

export default meta;

const primaryOptions: SakanaWidgetProps["options"] = {
	character: "chisato",
	controls: true,
	draggable: true,
	rod: true,
	title: true,
};

const sakanaWidgetOptionsKeys: Array<keyof SakanaWidgetOptions> = [
	"autoFit",
	"character",
	"controls",
	"draggable",
	"rod",
	"rotate",
	"size",
	"stroke",
	"title",
];

const sakanaWidgetStateKeys: Array<keyof SakanaWidgetState> = [
	"d",
	"i",
	"r",
	"s",
	"t",
	"w",
	"y",
];

export const Primary = {
	args: {
		style: {
			display: "grid",
			height: 400,
			placeContent: "center",
		},
		...primaryOptions,
	},
	render: ({ style, options, ...restProps }: SakanaWidgetProps) => {
		const controlsOptions = pick(
			restProps as SakanaWidgetOptions,
			sakanaWidgetOptionsKeys,
		);

		const ref = useRef<SakanaWidgetClass>(null);

		useLayoutEffect(() => {
			const controlsState = pick(
				restProps as Partial<SakanaWidgetState>,
				sakanaWidgetStateKeys,
			);
			ref.current!.setState(controlsState);
		}, [restProps]);

		return (
			<SakanaWidget
				options={{
					...controlsOptions,
					...options,
				}}
				innerRef={ref}
				style={style}
			/>
		);
	},
};

export const DisableBounceOnMount = {
	args: {
		disableBounceOnMount: true,
	},
	render: ({ disableBounceOnMount }: SakanaWidgetProps) => {
		return <SakanaWidget disableBounceOnMount={disableBounceOnMount} />;
	},
};

export const TestAvoidUnmountOnPropsChanges = {
	args: primaryOptions,
	render: ({ options, ...restProps }: SakanaWidgetProps) => {
		const [count, setCount] = useState(0);
		const controlsOptions = pick(
			restProps as SakanaWidgetOptions,
			sakanaWidgetOptionsKeys,
		);
		return (
			<div>
				<p>
					Count: {count}{" "}
					<button type="button" onClick={() => setCount((prev) => prev + 1)}>
						+1
					</button>
				</p>
				<SakanaWidget
					options={{
						...controlsOptions,
						...options,
					}}
				/>
			</div>
		);
	},
};
