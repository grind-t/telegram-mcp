import { getBasicPeerType, type Peer } from "@mtcute/node";
import type { PeerOutput } from "../schemas/PeerOutput.ts";

export function peerToOutput({ id, inputPeer }: Peer): PeerOutput {
	return {
		id,
		type: getBasicPeerType(inputPeer),
	};
}
