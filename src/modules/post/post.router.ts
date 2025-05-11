import { Router } from "express";

import { Authenticate } from "@/middleware/authenticate.middleware";
import { validate } from "@/middleware/validateRequest.middleware";
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  listPostsHandler,
  updatePostHandler,
} from "@modules/post/post.controller";
import {
  createPostSchema,
  deletePostSchema,
  generatePresignedUrlSchema,
  getPostSchema,
  updatePostSchema,
} from "@modules/post/post.schema";
import { generatePresignedUrl } from "./post.utils";

const router = Router();

router
  .route("/")
  .post(validate(createPostSchema), Authenticate, createPostHandler)
  .get(listPostsHandler);

router.get("/:slug", validate(getPostSchema), getPostHandler);

router
  .route("/:postId")
  .patch(validate(updatePostSchema), Authenticate, updatePostHandler)
  .delete(validate(deletePostSchema), Authenticate, deletePostHandler);

router.post(
  "/generate-presigned-url",
  validate(generatePresignedUrlSchema),
  Authenticate,
  generatePresignedUrl,
);

export default router;
