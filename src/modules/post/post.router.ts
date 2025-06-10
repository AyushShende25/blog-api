import { Router } from "express";

import { Authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { validate } from "@/middleware/validateRequest.middleware";
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getUserPosts,
  listPostsHandler,
  updatePostHandler,
} from "@modules/post/post.controller";
import {
  createPostSchema,
  deletePostSchema,
  generatePresignedUrlSchema,
  getPostSchema,
  getUserPostsSchema,
  updatePostSchema,
} from "@modules/post/post.schema";
import { generatePresignedUrl } from "./post.utils";

const router = Router();

router
  .route("/")
  .post(validate(createPostSchema), Authenticate, createPostHandler)
  .get(listPostsHandler);

router.get("/user", validate(getUserPostsSchema), Authenticate, getUserPosts);

router.get("/:slug", validate(getPostSchema), getPostHandler);

router
  .route("/:postId")
  .patch(
    validate(updatePostSchema),
    Authenticate,
    authorize("ADMIN", "USER"),
    updatePostHandler,
  )
  .delete(
    validate(deletePostSchema),
    Authenticate,
    authorize("ADMIN", "USER"),
    deletePostHandler,
  );

router.post(
  "/generate-presigned-url",
  validate(generatePresignedUrlSchema),
  Authenticate,
  generatePresignedUrl,
);

export default router;
