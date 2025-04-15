import { Router } from "express";

import {
  getCategoriesHandler,
  getFeaturedCategoriesHandler,
} from "@modules/categories/category.controller";

const router = Router();

router.get("/", getCategoriesHandler);

router.get("/featured", getFeaturedCategoriesHandler);

export default router;
