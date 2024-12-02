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
  getPostSchema,
  updatePostSchema,
} from "@modules/post/post.schema";

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

export default router;
