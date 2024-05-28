import { buildConfig } from "eslint-config-pcp";

export default (await buildConfig()).filter(
	(rule) => rule.name !== "pcp/react",
);
