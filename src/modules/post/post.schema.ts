import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Post title is required",
      })
      .trim(),
    content: z
      .string({
        required_error: "Post content is required",
      })
      .trim(),
    categories: z.array(z.string()).optional(),
    images: z
      .array(z.string().url("Invalid image URL"))
      .max(10, { message: "You can attach up to 10 images per post" })
      .optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT").optional(),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
