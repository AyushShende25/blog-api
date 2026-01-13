import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["src/server.ts", "src/worker.ts"],
	clean: true,
	outDir: "dist",
	ignoreWatch: ["logs"],
	format: "esm",
});
