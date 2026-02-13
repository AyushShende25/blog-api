import { Router } from "express";
import { Permissions } from "@/authorization/permissions";
import { Authenticate } from "@/middleware/authenticate.middleware";
import { RequirePermission } from "@/middleware/authorize.middleware";
import {
	createTagController,
	deleteTagController,
	getTagsController,
	updateTagController,
} from "./tags.controller";

const router = Router();

router.get("/", getTagsController);

router.post(
	"/",
	Authenticate,
	RequirePermission(Permissions.TAG_CREATE),
	createTagController,
);

router.patch(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.TAG_UPDATE),
	updateTagController,
);

router.delete(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.TAG_DELETE),
	deleteTagController,
);

export default router;
