import z from "zod";

import Logger from "@/utils/logger";

const envSchema = z.object({
	PORT: z.coerce.number().default(8000),
	NODE_ENV: z.enum(["development", "production"]).default("development"),
	DATABASE_URL: z.string(),
	SALT_ROUNDS: z.coerce.number().default(10),
	CLIENT_URL: z.string(),
	EMAIL_USERNAME: z.string(),
	EMAIL_PASSWORD: z.string(),
	EMAIL_PORT: z.coerce.number().default(2525),
	EMAIL_HOST: z.string(),
	EMAIL_FROM: z.string(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
	Logger.error("Invalid environment variables");
	Logger.error(envVars.error.format());
	process.exit(1);
}

export const env = envVars.data;
