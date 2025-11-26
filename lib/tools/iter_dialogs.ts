import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TelegramClient } from "@mtcute/node";
import z from "zod";
import {
	PeerInputSchema,
	resolvePeerFromInput,
} from "../common/utils/peerInput.ts";
import { PeerOutputSchema, peerToOutput } from "../common/utils/peerOutput.ts";
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
					.describe("How to handle archived chats? Default - exclude"),
				limit: z
					.number()
					.optional()
					.describe(
						"Limits the number of dialogs to be received. Default - no limit",
					),
				folderId: z
					.number()
					.optional()
					.describe("ID of the folder from which the dialogs will be fetched"),
				folderTitle: z
					.string()
					.optional()
					.describe(
						"Title of the folder from which the dialogs will be fetched",
					),
				offsetPeer: PeerInputSchema.optional().describe(
					"Offset peer used as an anchor for pagination",
				),
				pinned: z
					.literal(["include", "exclude", "only", "keep"])
					.optional()
					.describe("How to handle pinned dialogs? Default - include"),
			},
			outputSchema: {
				dialogs: z.array(
					z.object({
						peer: PeerOutputSchema,
						displayName: z.string(),
						unreadCount: z.number(),
						unreadMentionsCount: z.number(),
						muteUntil: z.number().nullish(),
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

					dialogs.push({
						peer: peerToOutput(peer),
						displayName: peer.displayName,
						unreadCount,
						unreadMentionsCount,
						muteUntil: raw.notifySettings.muteUntil,
					});
				}

				return toolJson({ dialogs });
			} catch (error) {
				return toolError(error);
			}
		},
	);
