import { PostStatus } from "generated/prisma/enums";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";
import type { CreateCommentInput } from "./comments.schema";

export const createComment = async ({
	userId,
	postId,
	input,
}: {
	userId: string;
	postId: string;
	input: CreateCommentInput;
}) => {
	const post = await db.post.findFirst({
		where: { id: postId, status: PostStatus.PUBLISHED, deletedAt: null },
	});
	if (!post) throw new NotFoundError("Post not found");

	if (input.parentId) {
		const parent = await db.comment.findFirst({
			where: { id: input.parentId, postId },
		});

		if (!parent) {
			throw new BadRequestError("Invalid parent comment");
		}
		if (parent.isDeleted) {
			throw new BadRequestError("Cannot reply to deleted comment");
		}
	}

	return await db.comment.create({
		data: {
			content: input.content,
			authorId: userId,
			postId,
			parentId: input.parentId,
		},
	});
};

export const getComments = async ({
	postId,
	page,
	limit,
}: {
	postId: string;
	page: number;
	limit: number;
}) => {
	return await db.comment.findMany({
		where: { postId, parentId: null },
		orderBy: { createdAt: "desc" },
		skip: (page - 1) * limit,
		take: limit,
		include: {
			author: {
				select: { username: true, avatar: true },
			},
			replies: {
				orderBy: { createdAt: "asc" },
				where: {},
			},
		},
	});
};

export const updateComment = async ({
	commentId,
	content,
}: {
	content: string;
	commentId: string;
}) => {
	return await db.comment.update({
		where: { id: commentId },
		data: {
			content,
		},
		select: {
			id: true,
			content: true,
			updatedAt: true,
		},
	});
};

export const deleteComment = async (commentId: string) => {
	await db.comment.update({
		where: { id: commentId },
		data: {
			isDeleted: true,
			content: "",
		},
	});
};
