import type { Request, Response } from "express";
import { getTagsSchema, paramsTagSchema, tagSchema } from "./tags.schema";
import { createTag, deleteTag, getTags, updateTag } from "./tags.service";

export const getTagsController = async (req: Request, res: Response) => {
	const { search } = getTagsSchema.parse(req.query);

	const tags = await getTags(search);

	res.status(200).json({
		tags,
	});
};

export const createTagController = async (req: Request, res: Response) => {
	const { name } = tagSchema.parse(req.body);

	const tag = await createTag(name);

	res.status(201).json({ tag });
};

export const updateTagController = async (req: Request, res: Response) => {
	const { id } = paramsTagSchema.parse(req.params);
	const { name } = tagSchema.parse(req.body);

	const tag = await updateTag({ id, name });

	res.status(200).json({ tag });
};

export const deleteTagController = async (req: Request, res: Response) => {
	const { id } = paramsTagSchema.parse(req.params);

	await deleteTag(id);

	res.status(204).send();
};
