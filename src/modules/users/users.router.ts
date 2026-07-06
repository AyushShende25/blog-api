import {
	checkIsFollowingController,
	deleteMyAccountController,
	deleteUserController,
	followUserController,
	getMyAccountController,
	getMyFollowersController,
	getMyFollowingController,
	getUserFollowersController,
	getUserFollowingController,
	getUserStatsController,
	getUsersController,
	unfollowUserController,
	updateMyAccountController,
	updateUserController,
} from "@modules/users/users.controller";
import { Router } from "express";
import { Permissions } from "@/authorization/permissions";
import { Authenticate } from "@/middleware/authenticate.middleware";
import { RequirePermission } from "@/middleware/authorize.middleware";

const router: Router = Router();

router.get(
	"/",
	Authenticate,
	RequirePermission(Permissions.USER_READ_ANY),
	getUsersController,
);

router.get("/me/followers", Authenticate, getMyFollowersController);

router.get("/me/following", Authenticate, getMyFollowingController);

router.get(
	"/me",
	Authenticate,
	RequirePermission(Permissions.USER_READ_SELF),
	getMyAccountController,
);

router.patch(
	"/me",
	Authenticate,
	RequirePermission(Permissions.USER_UPDATE_SELF),
	updateMyAccountController,
);

router.delete(
	"/me",
	Authenticate,
	RequirePermission(Permissions.USER_DELETE_SELF),
	deleteMyAccountController,
);

router.post("/:id/follow", Authenticate, followUserController);

router.delete("/:id/follow", Authenticate, unfollowUserController);

router.get("/:id/followers", Authenticate, getUserFollowersController);

router.get("/:id/following", Authenticate, getUserFollowingController);

router.get("/:id/is-following", Authenticate, checkIsFollowingController);

router.get("/:id/stats", Authenticate, getUserStatsController);

router.patch(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.USER_MANAGE_ANY),
	updateUserController,
);

router.delete(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.USER_MANAGE_ANY),
	deleteUserController,
);

export default router;
