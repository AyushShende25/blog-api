import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["src/server.ts", "src/jobs/worker.ts"],
	clean: true,
	outDir: "dist",
	ignoreWatch: ["logs"],
	format: "esm",
});
