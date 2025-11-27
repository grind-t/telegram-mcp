import { getBasicPeerType, type Peer } from "@mtcute/node";
import z from "zod";

export const PeerOutputSchema = z.object({
	id: z.number(),
	type: z.literal(["user", "chat", "channel"]),
});

export const peerToOutput = ({ id, inputPeer }: Peer): PeerOutput => ({
	id,
	type: getBasicPeerType(inputPeer),
});

export type PeerOutput = z.infer<typeof PeerOutputSchema>;
