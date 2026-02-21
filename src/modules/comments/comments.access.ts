import type { NextFunction, Request, Response } from "express";
import { Permissions } from "@/authorization/permissions";
import { ForbiddenError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";
import { commentIdSchema } from "./comments.schema";

export const canAccessComment =
	(overridePermission = Permissions.COMMENT_MANAGE_ANY) =>
	async (req: Request, _: Response, next: NextFunction) => {
		const { id } = commentIdSchema.parse(req.params);

		const comment = await db.comment.findUnique({
			where: { id },
			select: { authorId: true, isDeleted: true },
		});

		if (!comment) {
			throw new NotFoundError("Comment not found");
		}

		const isOwner = comment.authorId === req.user!.id;
		const canOverride = req.user!.permissions.includes(overridePermission);

		if (!isOwner && !canOverride) {
			throw new ForbiddenError("Insufficient permissions");
		}

		if (comment.isDeleted && !canOverride) {
			throw new ForbiddenError("Comment is deleted");
		}

		next();
	};
