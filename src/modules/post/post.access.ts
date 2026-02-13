import type { NextFunction, Request, Response } from "express";
import { Permissions } from "@/authorization/permissions";
import { ForbiddenError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";
import { postIdSchema } from "./post.schema";

export const canAccessPost =
	(overridePermission = Permissions.POST_MANAGE_ANY) =>
	async (req: Request, _: Response, next: NextFunction) => {
		const user = req.user;

		if (!user) {
			throw new ForbiddenError("Authentication required");
		}

		const { id } = postIdSchema.parse(req.params);

		const post = await db.post.findUnique({
			where: { id },
			select: { authorId: true, deletedAt: true },
		});

		if (!post) {
			throw new NotFoundError("Post not found");
		}

		const isOwner = post.authorId === req.user?.id;
		const canOverride = user.permissions.includes(overridePermission);

		if (post.deletedAt && !canOverride) {
			throw new ForbiddenError("Post is deleted");
		}

		if (!isOwner && !canOverride) {
			throw new ForbiddenError("Insufficient permissions");
		}
		next();
	};
