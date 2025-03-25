import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { getFiveCategoriesWithHighestPostCountService } from "@modules/categories/category.service";

export const getFeaturedCategoriesHandler = async (
  req: Request,
  res: Response,
) => {
  const featuredCategories =
    await getFiveCategoriesWithHighestPostCountService();

  res.status(StatusCodes.OK).json({
    success: true,
    data: featuredCategories,
  });
};
