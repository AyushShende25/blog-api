import { Router } from "express";

import { Authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { validate } from "@/middleware/validateRequest.middleware";
import {
  getCurrentUserHandler,
  getSavedPostsHandler,
  savePosthandler,
  unsavePostHandler,
  updateAvatarHandler,
} from "@modules/users/users.controller";
import {
  savePostSchema,
  unsavePostSchema,
  updateAvatarSchema,
} from "@modules/users/users.schema";

const router: Router = Router();

router.get("/me", Authenticate, getCurrentUserHandler);
router.get("/saved", Authenticate, getSavedPostsHandler);
router
  .route("/saved/:postId")
  .post(validate(savePostSchema), Authenticate, savePosthandler)
  .delete(validate(unsavePostSchema), Authenticate, unsavePostHandler);
router.post(
  "/update-avatar",
  validate(updateAvatarSchema),
  Authenticate,
  authorize("USER"),
  updateAvatarHandler,
);
export default router;
