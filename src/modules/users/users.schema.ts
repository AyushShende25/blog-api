import { postIdSchema } from "@modules/post/post.schema";
import { z } from "zod";

export const savePostSchema = z.object({ params: postIdSchema });

export const unsavePostSchema = z.object({ params: postIdSchema });

export const updateAvatarSchema = z.object({
  body: z.object({
    avatarUrl: z.string().url().min(1, "avatar url cannot be empty"),
  }),
});

export type SavePostInput = z.infer<typeof savePostSchema>["params"];

export type UnsavePostInput = z.infer<typeof unsavePostSchema>["params"];

export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>["body"];
