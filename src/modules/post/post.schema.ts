import * as z from "zod";

export const createPostSchema = z
	.object({
		title: z
			.string()
			.trim()
			.min(1, "Title cannot be empty")
			.max(200, "Title must be less than 200 characters"),
		content: z.string().trim().optional().default(""),
		excerpt: z
			.string()
			.trim()
			.max(300, "Excerpt should be less than 300 characters")
			.optional(),
		metaTitle: z
			.string()
			.trim()
			.max(50, "Meta title should be less than 50 characters")
			.optional(),
		metaDescription: z
			.string()
			.trim()
			.max(150, "Meta description should be less than 150 characters for SEO")
			.optional(),
		ogImage: z.url("Invalid OG image URL").optional(),
		coverImage: z.url("Invalid cover image URL").optional(),
		categoryIds: z
			.array(z.uuid())
			.min(1, "Provide at least one category")
			.max(3, "Maximum 3 categories allowed")
			.transform((arr) => [...new Set(arr)]),
		tagIds: z
			.array(z.uuid())
			.min(1, "provide at least one tag")
			.max(5, "Maximum 5 tags allowed")
			.transform((arr) => [...new Set(arr)]),
		mediaIds: z
			.array(z.uuid("Invalid media ID format"))
			.max(10, { message: "You can attach up to 10 images per post" })
			.optional()
			.default([]),
		status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
		publishAt: z.date().optional(),
	})
	.refine(
		(data) => (data.status === "PUBLISHED" ? !!data.content.trim() : true),
		{
			error: "Published posts must have content",
			path: ["content"],
		},
	);

export const updatePostSchema = z.object({
	title: z.string().trim().min(1).max(200).optional(),
	content: z.string().trim().optional(),
	excerpt: z.string().trim().max(300).optional(),
	metaTitle: z.string().trim().max(50).optional(),
	metaDescription: z.string().trim().max(150).optional(),
	ogImage: z.url().optional(),
	coverImage: z.url().nullable().optional(),
	categoryIds: z
		.array(z.uuid())
		.min(1, "Provide at least one category")
		.max(3, "Maximum 3 categories allowed")
		.transform((arr) => [...new Set(arr)])
		.optional(),
	tagIds: z
		.array(z.uuid())
		.min(1, "provide at least one tag")
		.max(5, "Maximum 5 tags allowed")
		.transform((arr) => [...new Set(arr)])
		.optional(),
	mediaIds: z.array(z.uuid()).optional(),
	status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
	publishAt: z.date().optional(),
});

const baseGetPostsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	sort: z.string().default("createdAt:desc"),
	search: z.string().trim().toLowerCase().optional(),
	category: z.string().trim().toLowerCase().optional(),
	tag: z.string().trim().toLowerCase().optional(),
	dateFrom: z.coerce.date().optional(),
	dateTo: z.coerce.date().optional(),
});

export const getPublishedPostsSchema = baseGetPostsSchema;

export const getAllPostsSchema = baseGetPostsSchema.extend({
	status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
	includeDeleted: z.coerce.boolean().default(false).optional(),
});

export const getPostBySlugSchema = z.object({
	slug: z.string().trim(),
});

export const getUserPostsSchema = z.object({
	query: z.object({
		status: z.enum(["DRAFT", "PUBLISHED"], {
			message: "status is required PUBLISHED or DRAFT",
		}),
	}),
});

export const postIdSchema = z.object({
	id: z.uuid(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export type GetPostBySlugInput = z.infer<typeof getPostBySlugSchema>;

export type GetPublishedPostsInput = z.infer<typeof getPublishedPostsSchema>;

export type GetAllPostsInput = z.infer<typeof getAllPostsSchema> & {
	authorId?: string;
	authorUsername?: string;
};

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
