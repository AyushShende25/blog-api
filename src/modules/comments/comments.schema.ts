import * as z from "zod";

export const createCommentSchema = z.object({
	content: z.string().trim(),
	parentId: z.uuid().optional(),
});

export const updateCommentSchema = z.object({
	content: z.string().trim(),
});

export const postIdSchema = z.object({
	id: z.uuid(),
});

export const commentIdSchema = z.object({
	id: z.uuid(),
});

export const getCommentsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
