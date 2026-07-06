import type { Request, Response } from "express";
import { postIdSchema } from "./likes.schema";
import {
	addLike,
	checkLikedStatus,
	getLikesCount,
	removeLike,
} from "./likes.service";

export const addLikeController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);

	const likeId = await addLike({ userId: req.user!.id, postId: id });

	res.status(200).json({ like: likeId });
};

export const removeLikeController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);

	await removeLike({ userId: req.user!.id, postId: id });

	res.status(204).send();
};

export const checkLikeStatusController = async (
	req: Request,
	res: Response,
) => {
	const { id } = postIdSchema.parse(req.params);

	const hasLiked = await checkLikedStatus({ userId: req.user!.id, postId: id });

	res.status(200).json({ hasLiked: !!hasLiked });
};

export const getPostLikesCountController = async (
	req: Request,
	res: Response,
) => {
	const { id } = postIdSchema.parse(req.params);

	const count = await getLikesCount(id);

	res.status(200).json({ count });
};
