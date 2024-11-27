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
import { createPostSchema } from "@modules/post/post.schema";

const router = Router();

router
  .route("/")
  .post(validate(createPostSchema), Authenticate, createPostHandler)
  .get(listPostsHandler);

router.get("/:slug", getPostHandler);

router.route("/:id").patch(updatePostHandler).delete(deletePostHandler);
export default router;
