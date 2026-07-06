import { Router } from "express";
import { Permissions } from "@/authorization/permissions";
import { Authenticate } from "@/middleware/authenticate.middleware";
import { RequirePermission } from "@/middleware/authorize.middleware";
import {
	addLikeController,
	checkLikeStatusController,
	getPostLikesCountController,
	removeLikeController,
} from "./likes.controller";

const router = Router();
router.post(
	"/post/:id",
	Authenticate,
	RequirePermission(Permissions.LIKE_CREATE),
	addLikeController,
);

router.delete(
	"/post/:id",
	Authenticate,
	RequirePermission(Permissions.LIKE_DELETE_OWN),
	removeLikeController,
);

router.get("/post/:id/liked", Authenticate, checkLikeStatusController);
router.get("/post/:id/count", getPostLikesCountController);

export default router;
