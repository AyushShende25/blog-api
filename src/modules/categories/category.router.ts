import {
	createCategoryController,
	deleteCategoryController,
	getCategoriesController,
	updateCategoryController,
} from "@modules/categories/category.controller";
import { Router } from "express";
import { Permissions } from "@/authorization/permissions";
import { Authenticate } from "@/middleware/authenticate.middleware";
import { RequirePermission } from "@/middleware/authorize.middleware";

const router = Router();

router.get("/", getCategoriesController);

router.post(
	"/",
	Authenticate,
	RequirePermission(Permissions.CATEGORY_CREATE),
	createCategoryController,
);

router.patch(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.CATEGORY_UPDATE),
	updateCategoryController,
);

router.delete(
	"/:id",
	Authenticate,
	RequirePermission(Permissions.CATEGORY_DELETE),
	deleteCategoryController,
);

export default router;
