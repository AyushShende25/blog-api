import { Router } from "express";
import { Permissions } from "@/authorization/permissions";
import { Authenticate } from "@/middleware/authenticate.middleware";
import { RequirePermission } from "@/middleware/authorize.middleware";
import { canAccessComment } from "./comments.access";
import {
	createCommentController,
	getCommentsController,
	getPostCommentsCountController,
	removeCommentController,
	updateCommentController,
} from "./comments.controller";

const router = Router();

router.get("/post/:id", getCommentsController);

router.post(
	"/post/:id",
	Authenticate,
	RequirePermission(Permissions.COMMENT_CREATE),
	createCommentController,
);

router.get("/post/:id/count", getPostCommentsCountController);

router.patch(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.COMMENT_UPDATE_OWN),
	canAccessComment(Permissions.COMMENT_MANAGE_ANY),
	updateCommentController,
);

router.delete(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.COMMENT_DELETE_OWN),
	canAccessComment(Permissions.COMMENT_MANAGE_ANY),
	removeCommentController,
);

export default router;
