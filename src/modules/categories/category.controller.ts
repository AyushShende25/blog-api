import {
	categorySchema,
	paramsCategorySchema,
} from "@modules/categories/category.schema";
import {
	createCategory,
	deleteCategory,
	getAllCategories,
	updateCategory,
} from "@modules/categories/category.service";
import type { Request, Response } from "express";

export const getCategoriesController = async (_req: Request, res: Response) => {
	const categories = await getAllCategories();

	res.status(200).json({
		categories,
	});
};

export const createCategoryController = async (req: Request, res: Response) => {
	const { name } = categorySchema.parse(req.body);

	const category = await createCategory(name);

	res.status(201).json({
		category,
	});
};

export const updateCategoryController = async (req: Request, res: Response) => {
	const { id } = paramsCategorySchema.parse(req.params);
	const { name } = categorySchema.parse(req.body);

	const category = await updateCategory({ id, name });

	res.status(200).json({
		category,
	});
};

export const deleteCategoryController = async (req: Request, res: Response) => {
	const { id } = paramsCategorySchema.parse(req.params);

	await deleteCategory(id);

	res.status(204).send();
};
