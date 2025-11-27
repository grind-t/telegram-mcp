import z from "zod";
import { ForumTopicSchema } from "./ForumTopic.ts";
import { PeerOutputSchema } from "./PeerOutput.ts";

export const DialogSchema = z.object({
	peer: PeerOutputSchema,
	displayName: z.string(),
	unreadCount: z.number(),
	unreadMentionsCount: z.number(),
	muteUntil: z.number().nullish(),
	forumTopics: z.array(ForumTopicSchema).optional(),
});

export type Dialog = z.infer<typeof DialogSchema>;
