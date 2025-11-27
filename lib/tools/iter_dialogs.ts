import { title } from "node:process";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TelegramClient } from "@mtcute/node";
import z from "zod";
import {
	PeerInputSchema,
	resolvePeerFromInput,
} from "../common/schemas/PeerInput.ts";
import {
	PeerOutputSchema,
	peerToOutput,
} from "../common/schemas/PeerOutput.ts";
import { toolError } from "../common/utils/toolError.ts";
import { toolJson } from "../common/utils/toolJson.ts";

export const iterDialogsTool = (
	register: McpServer["registerTool"],
	tg: TelegramClient,
) =>
	register(
		"iter_dialogs",
		{
			title: "Iterate over Telegram dialogs",
			description: "Iterate over Telegram dialogs",
			inputSchema: {
				archived: z
					.literal(["exclude", "only", "keep"])
					.optional()
					.describe("Filter archived dialogs"),
				limit: z
					.number()
					.optional()
					.describe("Limit the number of dialogs to retrieve"),
				folderId: z.number().optional().describe("Filter dialogs by folder ID"),
				folderTitle: z
					.string()
					.optional()
					.describe("Filter dialogs by folder title"),
				offsetPeer: PeerInputSchema.optional().describe(
					"Offset peer used as an anchor for pagination",
				),
				pinned: z
					.literal(["include", "exclude", "only", "keep"])
					.optional()
					.describe("Filter pinned dialogs"),
			},
			outputSchema: {
				dialogs: z.array(
					z.object({
						peer: PeerOutputSchema,
						displayName: z.string(),
						unreadCount: z.number(),
						unreadMentionsCount: z.number(),
						muteUntil: z.number().nullish(),
						forumTopics: z
							.array(
								z.object({
									id: z.number(),
									title: z.string(),
									unreadCount: z.number(),
									unreadMentionsCount: z.number(),
								}),
							)
							.optional(),
					}),
				),
			},
		},
		async ({ archived, limit, folderId, folderTitle, offsetPeer, pinned }) => {
			try {
				const dialogs = [];

				for await (const dialog of tg.iterDialogs({
					archived,
					folder: folderId ?? folderTitle,
					limit,
					offsetPeer: await resolvePeerFromInput(tg, offsetPeer),
					pinned,
				})) {
					const { peer, unreadCount, unreadMentionsCount, raw } = dialog;
					const forumTopics = [];

					if (peer.type === "chat" && peer.isForum) {
						for await (const topic of tg.iterForumTopics(peer)) {
							forumTopics.push({
								id: topic.id,
								title: topic.title,
								unreadCount: topic.unreadCount,
								unreadMentionsCount: topic.unreadMentionsCount,
							});
						}
					}

					dialogs.push({
						peer: peerToOutput(peer),
						displayName: peer.displayName,
						unreadCount,
						unreadMentionsCount,
						muteUntil: raw.notifySettings.muteUntil,
						forumTopics: forumTopics.length ? forumTopics : undefined,
					});
				}

				return toolJson({ dialogs });
			} catch (error) {
				return toolError(error);
			}
		},
	);
