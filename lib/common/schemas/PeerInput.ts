import { getMarkedPeerId, type TelegramClient, type tl } from "@mtcute/node";
import z from "zod";

export const PeerInputSchema = z.object({
	id: z.string().describe("ID, username, phone number or 'me'/'self'"),
	type: z.literal(["user", "chat", "channel"]),
});

export const peerFromInput = ({ id, type }: PeerInput) => ({
	id: Number.isNaN(Number(id)) ? id : getMarkedPeerId(Number(id), type),
	type,
});

export function resolvePeerFromInput(
	tg: TelegramClient,
	peerInput: PeerInput,
): Promise<tl.TypeInputPeer>;
export function resolvePeerFromInput(
	tg: TelegramClient,
	peerInput: undefined,
): undefined;
export function resolvePeerFromInput(
	tg: TelegramClient,
	peerInput: PeerInput | undefined,
): Promise<tl.TypeInputPeer> | undefined;
export function resolvePeerFromInput(
	tg: TelegramClient,
	peerInput: PeerInput | undefined,
) {
	return peerInput && tg.resolvePeer(peerFromInput(peerInput).id);
}

export type PeerInput = z.infer<typeof PeerInputSchema>;
