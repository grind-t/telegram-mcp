import { getMarkedPeerId, type TelegramClient } from "@mtcute/node";
import z from "zod";

export const PeerInputSchema = z.object({
	id: z.string(),
	type: z.literal(["user", "chat", "channel"]),
});

export const peerFromInput = ({ id, type }: PeerInput) => ({
	id: Number.isNaN(Number(id)) ? id : getMarkedPeerId(Number(id), type),
	type,
});

export const resolvePeerFromInput = (
	tg: TelegramClient,
	peerInput?: PeerInput,
) => peerInput && tg.resolvePeer(peerFromInput(peerInput).id);

export type PeerInput = z.infer<typeof PeerInputSchema>;
