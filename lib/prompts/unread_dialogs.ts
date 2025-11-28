import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { textPrompt } from "../common/utils/textPrompt.ts";

const promptTemplate = (number: number) => `
<prompt>
	<task>Read ${number} unread dialogs</task>
	<instructions>
		- A dialog is considered unread if:
			- It is NOT muted (muteUntil <= 0 or null) AND has unreadCount > 0
			- OR it IS muted AND has unreadMentionsCount > 0
		- Report which specific forum topics have unread messages if applicable
	</instructions>
</prompt>
`;

export const unreadDialogsPrompt = (register: McpServer["registerPrompt"]) =>
	register(
		"unread_dialogs",
		{
			argsSchema: {
				number: z.number().describe("Number of unread dialogs to read"),
			},
		},
		({ number }) => textPrompt(promptTemplate(number)),
	);
