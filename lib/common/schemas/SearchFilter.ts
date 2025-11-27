import { SearchFilters } from "@mtcute/node";
import z from "zod";

type SearchFilterKey = Exclude<keyof typeof SearchFilters, "Empty">;

const keys = Object.keys(SearchFilters).filter(
	(key) => key !== "Empty",
) as SearchFilterKey[];

const descriptions: Record<SearchFilterKey, string> = {
	Photo: "messages with photos",
	Video: "messages with videos",
	PhotoAndVideo: "messages with photos or videos",
	Document: "messages with documents",
	Url: "messages with URLs",
	Gif: "messages with GIFs",
	Voice: "messages with voice notes",
	Audio: "messages with audio files",
	ChatPhotoChange: "messages which are chat photo changes",
	Call: "messages which are phone calls",
	RoundAndVoice: "messages which are round videos and voice notes",
	Round: "messages which are round videos",
	MyMention: "messages with mentions of the current user",
	Location: "messages with geolocations",
	Contact: "messages with contacts",
	Pinned: "messages which are pinned",
};

export const SearchFilterSchema = z.literal(keys).describe(`
Filter messages by content:
${keys.map((key) => `${key} - ${descriptions[key]}`).join("\n")}
`);
