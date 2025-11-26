import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const toolJson = (
	structuredContent: CallToolResult["structuredContent"],
): CallToolResult => ({
	structuredContent,
	content: [
		{
			type: "text",
			text: JSON.stringify(structuredContent, null, 2),
		},
	],
});
