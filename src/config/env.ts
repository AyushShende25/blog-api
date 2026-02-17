import z from "zod";
import Logger from "@/libs/logger";

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
	JWT_ACCESS_SECRET: z.string(),
	JWT_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number(),
	REFRESH_TOKEN_TTL_SECONDS: z.coerce.number(),
	REDIS_URL: z.string(),
	BUCKET_ACCESS_KEY_ID: z.string(),
	BUCKET_SECRET_ACCESS_KEY: z.string(),
	BUCKET_REGION: z.string(),
	BUCKET_NAME: z.string(),
	BUCKET_CUSTOM_DOMAIN: z.string(),
	RESET_TOKEN_TTL_MS: z.coerce.number(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
	Logger.error("Invalid environment variables");
	Logger.error(z.prettifyError(envVars.error));
	process.exit(1);
}

export const env = envVars.data;
