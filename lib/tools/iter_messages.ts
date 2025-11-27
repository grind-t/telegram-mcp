import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchFilters, type TelegramClient } from "@mtcute/node";
import z from "zod";
import {
	PeerInputSchema,
	resolvePeerFromInput,
} from "../common/schemas/PeerInput.ts";
import {
	PeerOutputSchema,
	peerToOutput,
} from "../common/schemas/PeerOutput.ts";
import { SearchFilterSchema } from "../common/schemas/SearchFilter.ts";
import { toolError } from "../common/utils/toolError.ts";
import { toolJson } from "../common/utils/toolJson.ts";
import { attempt } from "../common/utils/withFallback.ts";

export const iterMessagesTool = (
	register: McpServer["registerTool"],
	tg: TelegramClient,
) =>
	register(
		"iter_messages",
		{
			title: "Iterate over Telegram messages",
			description: "Iterate over Telegram messages",
			inputSchema: {
				dialog: PeerInputSchema.describe(
					"Target dialog. When empty, will iterate across common message box",
				).optional(),
				query: z.string().describe("Filter messages by text").optional(),
				fromUser: z
					.string()
					.describe(
						"Filter messages by author (ID, username, phone or 'me' or 'self')",
					)
					.optional(),
				threadId: z
					.number()
					.describe("Filter messages by thread (forum topic)")
					.optional(),
				filter: SearchFilterSchema.optional(),
				minId: z.number().describe("Filter by minimum message ID").optional(),
				maxId: z.number().describe("Filter by maximum message ID").optional(),
				minDate: z
					.string()
					.describe("Filter by minimum message date")
					.optional(),
				maxDate: z
					.string()
					.describe("Filter by maximum message date")
					.optional(),
				startMessage: z
					.number()
					.describe(
						"Start message ID (only messages earlier will be returned). Default: sentinel",
					)
					.optional(),
				offset: z
					.number()
					.describe("Offset for start message: +n messages earlier or -n later")
					.optional(),
				limit: z
					.number()
					.describe("Limit the number of messages to retrieve")
					.optional(),
			},
			outputSchema: {
				messages: z.array(
					z.object({
						id: z
							.number()
							.describe("Unique message identifier inside this chat"),
						date: z.string().describe("Date when the message was sent"),
						isMention: z
							.boolean()
							.describe(
								"Whether this message contains mention of the current user",
							),
						isOutgoing: z
							.boolean()
							.describe(
								"Whether the message is incoming (received) or outgoing (sent by you)",
							),
						sender: PeerOutputSchema.describe("Message sender"),
						senderDisplayName: z
							.string()
							.describe("Display name of the message sender"),
						text: z.string().describe("Message text"),
						mediaType: z
							.string()
							.nullish()
							.describe("Type of media in the message"),
						link: z.string().describe("Link to the message").optional(),
					}),
				),
			},
		},
		async ({
			dialog,
			query,
			fromUser,
			threadId,
			filter,
			minId,
			maxId,
			minDate,
			maxDate,
			startMessage,
			offset,
			limit,
		}) => {
			try {
				const [chatIdPeer, fromUserPeer] = await Promise.all([
					resolvePeerFromInput(tg, dialog),
					resolvePeerFromInput(
						tg,
						fromUser ? { id: fromUser, type: "user" } : undefined,
					),
				]);

				const messages = [];

				for await (const message of tg.iterSearchMessages({
					chatId: chatIdPeer,
					query,
					fromUser: fromUserPeer,
					threadId,
					filter: filter ? SearchFilters[filter] : undefined,
					minId,
					maxId,
					minDate: minDate ? new Date(minDate) : undefined,
					maxDate: maxDate ? new Date(maxDate) : undefined,
					offset: startMessage,
					addOffset: offset,
					limit,
				})) {
					messages.push({
						id: message.id,
						date: message.date.toISOString(),
						isMention: message.isMention,
						isOutgoing: message.isOutgoing,
						senderPeer: peerToOutput(message.sender),
						senderDisplayName: message.sender.displayName,
						text: message.text,
						mediaType: message.media?.type,
						link: attempt(() => message.link, undefined),
					});
				}

				return toolJson({ messages });
			} catch (error) {
				return toolError(error);
			}
		},
	);
