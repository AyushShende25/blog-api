import { type Options, defineConfig } from "tsup";

export default defineConfig((options: Options) => ({
  entryPoints: ["src/server.ts"],
  clean: true,
  ...options,
}));
