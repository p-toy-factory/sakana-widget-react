import { buildConfig } from "eslint-config-pcp";

export default await buildConfig({
	react: {
		overrides: {
			"react-hooks/exhaustive-deps": [
				"error",
				{
					additionalHooks: "useIsomorphicLayoutEffect",
				},
			],
		},
	},
});
