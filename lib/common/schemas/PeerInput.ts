import z from "zod";

export const PeerInputSchema = z.object({
	id: z.string().describe("ID, username, phone number or 'me'/'self'"),
	type: z.literal(["user", "chat", "channel"]),
});

export type PeerInput = z.infer<typeof PeerInputSchema>;
