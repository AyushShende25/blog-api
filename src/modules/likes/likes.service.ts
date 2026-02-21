import { PostStatus } from "generated/prisma/enums";
import { NotFoundError } from "@/errors";
import { db } from "@/libs/db";

export const addLike = async ({
	userId,
	postId,
}: {
	userId: string;
	postId: string;
}) => {
	const post = await db.post.findFirst({
		where: { id: postId, status: PostStatus.PUBLISHED, deletedAt: null },
	});
	if (!post) throw new NotFoundError("Post not found");

	return await db.like.upsert({
		where: {
			postId_userId: { postId, userId },
		},
		update: {},
		create: { postId, userId },
	});
};

export const removeLike = async ({
	userId,
	postId,
}: {
	userId: string;
	postId: string;
}) => {
	return await db.like.delete({
		where: { postId_userId: { postId, userId } },
	});
};
