import * as z from "zod";

export const categorySchema = z.object({
	name: z.string().trim().toLowerCase().min(1).max(50),
});

export const paramsCategorySchema = z.object({
	id: z.uuid(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
