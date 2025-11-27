import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TelegramClient } from "@mtcute/node";
import z from "zod";
import { type Dialog, DialogSchema } from "../common/schemas/Dialog.ts";
import type { ForumTopic } from "../common/schemas/ForumTopic.ts";
import {
	PeerInputSchema,
	resolvePeerFromInput,
} from "../common/schemas/PeerInput.ts";
import { peerToOutput } from "../common/schemas/PeerOutput.ts";
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
			},
			outputSchema: {
				dialogs: z.array(DialogSchema),
			},
		},
		async ({ limit, folderId, folderTitle, offsetPeer }) => {
			try {
				const dialogs: Dialog[] = [];

				for await (const dialog of tg.iterDialogs({
					folder: folderId ?? folderTitle,
					limit,
					offsetPeer: await resolvePeerFromInput(tg, offsetPeer),
				})) {
					const { peer, unreadCount, unreadMentionsCount, raw } = dialog;
					let forumTopics: ForumTopic[] | undefined;

					if (peer.type === "chat" && peer.isForum) {
						forumTopics = [];
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
						forumTopics,
					});
				}

				return toolJson({ dialogs });
			} catch (error) {
				return toolError(error);
			}
		},
	);
