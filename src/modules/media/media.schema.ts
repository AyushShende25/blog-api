import * as z from "zod";

export const presignedUrlSchema = z.object({
	filename: z.string().min(1),
	mimeType: z.enum([
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
		"image/apng",
	]),
	usage: z.enum(["POST", "AVATAR"]).default("POST"),
});

export const createMediaSchema = z.object({
	url: z.url(),
	mimeType: z.string(),
	size: z.number().positive(),
	type: z.enum(["IMAGE", "VIDEO"]),
});

export const mediaIdSchema = z.object({
	id: z.uuid(),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
