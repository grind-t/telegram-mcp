import z from "zod";
import { PeerOutputSchema } from "./PeerOutput.ts";

export const MessageSchema = z.object({
	id: z.number().describe("Unique message identifier inside this chat"),
	date: z.string().describe("Date when the message was sent"),
	isMention: z
		.boolean()
		.describe("Whether this message contains mention of the current user"),
	isOutgoing: z
		.boolean()
		.describe(
			"Whether the message is incoming (received) or outgoing (sent by you)",
		),
	senderPeer: PeerOutputSchema.describe("Message sender"),
	senderDisplayName: z.string().describe("Display name of the message sender"),
	text: z.string().describe("Message text"),
	mediaType: z.string().nullish().describe("Type of media in the message"),
	link: z.string().describe("Link to the message").optional(),
});

export type Message = z.infer<typeof MessageSchema>;
