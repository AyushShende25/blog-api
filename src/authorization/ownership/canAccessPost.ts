import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";
import { Permissions } from "../permissions";

export const canAccessPost = async (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	const user = req.user;

	if (!user) {
		throw new ForbiddenError("Authentication required");
	}
	const post = await db.post.findUnique({
		where: { id: req.params.id as string },
		select: { authorId: true },
	});

	if (!post) {
		throw new NotFoundError("Post not found");
	}

	const isOwner = post.authorId === req.user?.id;
	const canOverride = req.user?.permissions.includes(
		Permissions.POST_MANAGE_ANY,
	);

	if (!isOwner && !canOverride) {
		throw new ForbiddenError("Insufficient permissions");
	}
	next();
};
