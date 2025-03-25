import { Router } from "express";

import { getFeaturedCategoriesHandler } from "@modules/categories/category.controller";

const router = Router();

router.get("/featured", getFeaturedCategoriesHandler);
export default router;
