import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { textPrompt } from "../common/utils/textPrompt.ts";

const promptTemplate = (limit: string, folder: string | undefined) => `
<prompt>
	<task>Read unread Telegram dialogs${folder ? ` in folder ${folder}` : ""}</task>
	<requirements>
		- iter_dialogs tool is available
		- iterate over ${limit} dialogs at most
	</requirements>
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
				limit: z
					.string()
					.refine((val) => Number.isInteger(Number(val)))
					.describe("Maximum number of dialogs to iterate over"),
				folder: z
					.string()
					.optional()
					.describe("Folder ID or title to filter dialogs by"),
			},
		},
		({ limit, folder }) => textPrompt(promptTemplate(limit, folder)),
	);
