import { defineConfig } from "tsup";

export default defineConfig({
	name: "@grind-t/telegram-mcp",
	entry: ["lib/index.ts"],
	outDir: "dist",
	format: ["cjs"],
	clean: true,
});
