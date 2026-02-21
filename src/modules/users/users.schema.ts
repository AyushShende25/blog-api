import * as z from "zod";

export const getAllUsersSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	sort: z.string().default("createdAt:desc"),
	search: z.string().toLowerCase().trim().optional(),
	status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]).optional(),
	includeDeleted: z.coerce.boolean().default(false).optional(),
});

export const updateMeSchema = z.object({
	avatar: z.url().optional(),
	bio: z.string().trim().max(300).optional(),
	socialLinks: z
		.array(
			z.object({
				platform: z.enum(["twitter", "linkedin", "github"]),
				link: z.url(),
			}),
		)
		.optional(),
	username: z.string().trim().min(3).max(30).optional(),
});

export const userIdSchema = z.object({
	id: z.uuid(),
});

export const updateUserSchema = z.object({
	isVerified: z.boolean().optional(),
	username: z.string().trim().min(3).max(30).optional(),
	bio: z.string().trim().max(300).nullable().optional(),
	avatar: z.url().nullable().optional(),
	socialLinks: z
		.array(
			z.object({
				platform: z.enum(["twitter", "linkedin", "github"]),
				link: z.url(),
			}),
		)
		.nullable()
		.optional(),
	role: z.enum(["USER", "ADMIN"]).optional(),
	status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]).optional(),
});

export const followSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GetAllUsersInput = z.infer<typeof getAllUsersSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
