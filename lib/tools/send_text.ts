import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TelegramClient } from "@mtcute/node";
import z from "zod";
import {
	PeerInputSchema,
	resolvePeerFromInput,
} from "../common/schemas/PeerInput.ts";
import { toolError } from "../common/utils/toolError.ts";
import { toolJson } from "../common/utils/toolJson.ts";

export const sendTextTool = (
	register: McpServer["registerTool"],
	tg: TelegramClient,
) =>
	register(
		"send_text",
		{
			inputSchema: {
				dialog: PeerInputSchema.describe(
					"Target dialog to send the message to",
				),
				text: z.string().describe("Text of the message"),
				replyTo: z
					.number()
					.optional()
					.describe("Message ID or forum topic ID to reply to"),
			},
		},
		async ({ dialog, text, replyTo }) => {
			try {
				await tg.sendText(await resolvePeerFromInput(tg, dialog), text, {
					replyTo,
				});
				return toolJson({ success: true });
			} catch (error) {
				return toolError(error);
			}
		},
	);
