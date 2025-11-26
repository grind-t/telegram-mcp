import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const toolError = (error: unknown): CallToolResult => ({
	content: [
		{
			type: "text",
			text: error instanceof Error ? error.message : String(error),
		},
	],
	isError: true,
});
