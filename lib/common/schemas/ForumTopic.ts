import z from "zod";

export const ForumTopicSchema = z.object({
	id: z.number(),
	title: z.string(),
	unreadCount: z.number(),
	unreadMentionsCount: z.number(),
});

export type ForumTopic = z.infer<typeof ForumTopicSchema>;
