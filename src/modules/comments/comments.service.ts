import { PostStatus } from "generated/prisma/enums";
import { BadRequestError, NotFoundError } from "@/errors";
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
	const offset = (page - 1) * limit;

	const comments = await db.$queryRaw`
  WITH RECURSIVE fc AS (
    -- Anchor member: Get top-level comments for the post (where parentId is NULL)
    (
			SELECT id, content, "authorId", "parentId", "postId", "isDeleted", "createdAt", "updatedAt"
			FROM comments 
			WHERE "postId" = ${postId} AND "parentId" IS NULL
			ORDER BY "createdAt" DESC  
			LIMIT ${limit} OFFSET ${offset}
		)
    
    UNION ALL 
    
    -- Recursive member: Join children to their parents
    SELECT c.id, c.content, c."authorId", c."parentId", c."postId", c."isDeleted", c."createdAt", c."updatedAt"
    FROM comments c
    INNER JOIN fc ON c."parentId" = fc.id
  )
  SELECT 
    fc.*, 
    u.username, 
    u.avatar
  FROM fc
  INNER JOIN users AS u ON fc."authorId" = u.id;
`;

	const [totalRootComments, absoluteTotalComments] = await Promise.all([
		db.comment.count({
			where: { postId, parentId: null },
		}),
		db.comment.count({
			where: { postId },
		}),
	]);

	const totalPages = Math.ceil(totalRootComments / limit);

	return {
		comments,
		meta: {
			page,
			limit,
			totalPages,
			totalThreads: totalRootComments,
			totalComments: absoluteTotalComments,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
	};
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

export const getCommentsCount = async (postId: string) => {
	const post = await db.post.findFirst({
		where: { id: postId, status: PostStatus.PUBLISHED, deletedAt: null },
	});
	if (!post) throw new NotFoundError("Post not found");

	const [totalThreads, totalComments] = await Promise.all([
		db.comment.count({
			where: { postId, parentId: null },
		}),
		db.comment.count({
			where: { postId },
		}),
	]);

	return {
		totalThreads,
		totalComments,
	};
};
