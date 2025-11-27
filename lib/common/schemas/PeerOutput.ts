import z from "zod";

export const PeerOutputSchema = z.object({
	id: z.number(),
	type: z.literal(["user", "chat", "channel"]),
});

export type PeerOutput = z.infer<typeof PeerOutputSchema>;
