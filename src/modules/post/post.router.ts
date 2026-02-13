import {
	bookmarkPostController,
	createPostController,
	deletePostController,
	getAllPostsController,
	getAuthorPostsController,
	getBookmarkedPostsController,
	getMyPostsController,
	getPostController,
	getPublishedPostsController,
	unbookmarkPostController,
	updatePostController,
} from "@modules/post/post.controller";
import { Router } from "express";
import { Permissions } from "@/authorization/permissions";
import { Authenticate } from "@/middleware/authenticate.middleware";
import { RequirePermission } from "@/middleware/authorize.middleware";
import { canAccessPost } from "./post.access";

const router = Router();

router.get("/", getPublishedPostsController);
router.get("/slug/:slug", getPostController);
router.get("/author/:username", getAuthorPostsController);

router.post(
	"/",
	Authenticate,
	RequirePermission(Permissions.POST_CREATE),
	createPostController,
);

router.get("/me", Authenticate, getMyPostsController);

router.get(
	"/admin",
	Authenticate,
	RequirePermission(Permissions.POST_READ_ANY),
	getAllPostsController,
);

router.get(
	"/me/bookmarks",
	Authenticate,
	RequirePermission(Permissions.USER_READ_SELF),
	getBookmarkedPostsController,
);

router.put(
	"/:id/bookmark",
	Authenticate,
	RequirePermission(Permissions.USER_READ_SELF),
	bookmarkPostController,
);

router.delete(
	"/:id/bookmark",
	Authenticate,
	RequirePermission(Permissions.USER_READ_SELF),
	unbookmarkPostController,
);

router.patch(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.POST_UPDATE_OWN),
	canAccessPost(),
	updatePostController,
);

router.delete(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.POST_DELETE_OWN),
	canAccessPost(),
	deletePostController,
);

export default router;
