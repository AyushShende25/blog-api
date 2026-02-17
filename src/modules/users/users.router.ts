import {
	deleteMyAccountController,
	deleteUserController,
	getMyAccountController,
	getUsersController,
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
