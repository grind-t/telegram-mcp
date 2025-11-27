import { getMarkedPeerId, type TelegramClient, type tl } from "@mtcute/node";
import type { PeerInput } from "../schemas/PeerInput.ts";

export function peerFromInput({ id, type }: PeerInput) {
	return {
		id: Number.isNaN(Number(id)) ? id : getMarkedPeerId(Number(id), type),
		type,
	};
}

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
