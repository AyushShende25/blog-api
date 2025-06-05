import { type Options, defineConfig } from "tsup";

export default defineConfig((options: Options) => ({
  entryPoints: ["src/server.ts", "src/jobs/worker.ts"],
  clean: true,
  ...options,
}));
