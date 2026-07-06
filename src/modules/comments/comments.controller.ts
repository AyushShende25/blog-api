import type { Request, Response } from "express";
import {
	commentIdSchema,
	createCommentSchema,
	getCommentsSchema,
	postIdSchema,
	updateCommentSchema,
} from "./comments.schema";
import {
	createComment,
	deleteComment,
	getComments,
	getCommentsCount,
	updateComment,
} from "./comments.service";

export const getCommentsController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);
	const { page, limit } = getCommentsSchema.parse(req.query);

	const { comments, meta } = await getComments({
		postId: id,
		page,
		limit,
	});

	res.status(200).json({ comments, meta });
};

export const getPostCommentsCountController = async (
	req: Request,
	res: Response,
) => {
	const { id } = postIdSchema.parse(req.params);

	const count = await getCommentsCount(id);

	res.status(200).json({ count });
};

export const createCommentController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);
	const input = createCommentSchema.parse(req.body);

	const comment = await createComment({
		userId: req.user!.id,
		postId: id,
		input,
	});

	res.status(201).json({ comment });
};

export const updateCommentController = async (req: Request, res: Response) => {
	const { id } = commentIdSchema.parse(req.params);
	const { content } = updateCommentSchema.parse(req.body);

	const comment = await updateComment({
		commentId: id,
		content,
	});

	res.status(200).json({ comment });
};

export const removeCommentController = async (req: Request, res: Response) => {
	const { id } = commentIdSchema.parse(req.params);

	await deleteComment(id);

	res.status(204).send();
};
