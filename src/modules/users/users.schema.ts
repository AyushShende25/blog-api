import { postIdSchema } from "@modules/post/post.schema";
import { z } from "zod";

export const savePostSchema = z.object({ params: postIdSchema });

export const unsavePostSchema = z.object({ params: postIdSchema });

export type SavePostInput = z.infer<typeof savePostSchema>["params"];

export type UnsavePostInput = z.infer<typeof unsavePostSchema>["params"];
