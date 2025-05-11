import { z } from "zod";

const basePostSchema = z.object({
  title: z
    .string({
      required_error: "Post title is required",
    })
    .trim(),
  content: z.string().trim().optional(),
  categories: z.array(z.string()).min(1, "provide atleast one category"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .max(5, { message: "You can attach up to 5 images per post" })
    .optional(),
  coverImage: z.string().url("Invalid image URL").optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT").optional(),
});

export const createPostSchema = z.object({
  body: basePostSchema,
});

export const getPostSchema = z.object({
  params: z.object({ slug: z.string({ required_error: "slug is required" }) }),
});

export const listPostsSchema = z.object({
  query: z.object({
    page: z.string(),
    limit: z.string(),
    category: z.string().optional(),
    sort: z.string().optional(),
    filter: z.string().optional(),
  }),
});

const postIdSchema = z.object({
  postId: z.string({ required_error: "post id is required" }),
});

export const updatePostSchema = z.object({
  body: basePostSchema.partial(),
  params: postIdSchema,
});

export const deletePostSchema = z.object({
  params: postIdSchema,
});

export const generatePresignedUrlSchema = z.object({
  body: z.object({ filename: z.string(), filetype: z.string() }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type GetPostInput = z.infer<typeof getPostSchema>["params"];
export type ListPostsInput = z.infer<typeof listPostsSchema>["query"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type DeletePostInput = z.infer<typeof deletePostSchema>["params"];
export type GeneratePresignedUrlInput = z.infer<
  typeof generatePresignedUrlSchema
>["body"];
