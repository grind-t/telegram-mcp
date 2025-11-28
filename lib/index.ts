import { env } from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MemoryStorage, TelegramClient } from "@mtcute/node";
import z from "zod";
import { unreadDialogsPrompt } from "./prompts/unread_dialogs.ts";
import { iterDialogsTool } from "./tools/iter_dialogs.ts";
import { iterMessagesTool } from "./tools/iter_messages.ts";
import { sendTextTool } from "./tools/send_text.ts";

const envValidation = z
	.object({
		API_ID: z.string(),
		API_HASH: z.string(),
		SESSION: z.string(),
	})
	.safeParse(env);

if (!envValidation.success) {
	console.error(z.prettifyError(envValidation.error));
	process.exit(1);
}

const { API_ID, API_HASH, SESSION } = envValidation.data;

const tg = new TelegramClient({
	apiId: Number(API_ID),
	apiHash: API_HASH,
	storage: new MemoryStorage(),
});

await tg.importSession(SESSION);

const server = new McpServer({
	name: "telegram-mcp",
	version: "1.0.0",
});

const registerTool = server.registerTool.bind(server);
const registerPrompt = server.registerPrompt.bind(server);

iterDialogsTool(registerTool, tg);
iterMessagesTool(registerTool, tg);
sendTextTool(registerTool, tg);
unreadDialogsPrompt(registerPrompt);

server.connect(new StdioServerTransport());
