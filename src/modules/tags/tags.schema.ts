import * as z from "zod";

export const getTagsSchema = z.object({
	search: z.string().trim().optional(),
});

export const tagSchema = z.object({
	name: z.string().trim().toLowerCase().min(1).max(50),
});

export const paramsTagSchema = z.object({
	id: z.uuid(),
});

export type TagInput = z.infer<typeof tagSchema>;
