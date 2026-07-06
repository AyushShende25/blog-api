import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Prisma } from "generated/prisma/client";
import { UserStatus } from "generated/prisma/enums";
import { env } from "@/config/env";
import { BadRequestError, ConflictError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";
import { s3 } from "@/libs/s3";
import { refreshTokenStore } from "@/store/refresh-token.store";
import type {
	GetAllUsersInput,
	UpdateMeInput,
	UpdateUserInput,
} from "./users.schema";
import { buildOrderBy, buildWhereClause } from "./users.utils";

export const getMe = async (userId: string) => {
	const user = await db.user.findFirst({
		where: { id: userId, status: UserStatus.ACTIVE, deletedAt: null },
		select: {
			id: true,
			email: true,
			username: true,
			role: true,
			socialLinks: true,
			avatar: true,
			bio: true,
			_count: {
				select: {
					followers: true,
					following: true,
					posts: true,
				},
			},
			createdAt: true,
		},
	});
	if (!user) {
		throw new NotFoundError("User account is inactive or does not exist");
	}
	return user;
};

export const getAllUsers = async (input: GetAllUsersInput) => {
	const { limit, page, sort, ...filters } = input;

	const where = buildWhereClause(filters);
	const orderBy = buildOrderBy(sort);

	const [users, total] = await Promise.all([
		db.user.findMany({
			skip: (page - 1) * limit,
			take: limit,
			where,
			orderBy,
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				status: true,
				avatar: true,
				createdAt: true,
				deletedAt: true,
			},
		}),
		db.user.count({ where }),
	]);

	return {
		users,
		meta: {
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			totalItems: total,
			hasNextPage: page < Math.ceil(total / limit),
			hasPreviousPage: page > 1,
		},
	};
};

export const updateMe = async ({
	userId,
	input,
}: {
	userId: string;
	input: UpdateMeInput;
}) => {
	const user = await db.user.findFirst({
		where: { id: userId, deletedAt: null, status: UserStatus.ACTIVE },
		select: { id: true },
	});
	if (!user) {
		throw new NotFoundError("user does not exist");
	}

	if (input.avatar && !input.avatar.startsWith(env.BUCKET_CUSTOM_DOMAIN)) {
		throw new BadRequestError("Invalid avatar url");
	}

	try {
		return await db.user.update({
			where: { id: userId },
			data: {
				bio: input.bio,
				avatar: input.avatar,
				socialLinks: input.socialLinks,
				username: input.username,
			},
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new ConflictError("This username is already taken");
			}
		}
		throw error;
	}
};

export const deleteMe = async (userId: string) => {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { avatar: true, id: true },
	});
	if (!user) {
		throw new NotFoundError("user does not exist");
	}

	await db.user.update({
		where: { id: userId },
		data: {
			deletedAt: new Date(),
			status: UserStatus.DELETED,
			username: `deleted-user-${userId}`,
			email: `deleted-${userId}@deleted.local`,
			bio: null,
			avatar: null,
			socialLinks: Prisma.DbNull,
		},
	});

	const fileKey = user.avatar?.replace(`${env.BUCKET_CUSTOM_DOMAIN}/`, "");

	if (fileKey) {
		await s3.send(
			new DeleteObjectCommand({
				Bucket: env.BUCKET_NAME,
				Key: fileKey,
			}),
		);
	}

	await refreshTokenStore.revokeAll(userId);
};

export const updateUser = async ({
	userId,
	input,
}: {
	userId: string;
	input: UpdateUserInput;
}) => {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { id: true },
	});
	if (!user) {
		throw new NotFoundError("user does not exist");
	}

	const deletedAt =
		input.status === "ACTIVE"
			? null
			: input.status === "DELETED"
				? new Date()
				: undefined;

	try {
		return await db.user.update({
			where: { id: userId },
			data: {
				isVerified: input.isVerified,
				username: input.username,
				bio: input.bio,
				avatar: input.avatar,
				role: input.role,
				status: input.status,
				deletedAt,
				socialLinks:
					input.socialLinks === undefined
						? undefined
						: input.socialLinks === null
							? Prisma.DbNull
							: input.socialLinks,
			},
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new ConflictError("username already taken");
			}
		}
		throw error;
	}
};

export const deleteUser = async (userId: string) => {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { id: true },
	});

	if (!user) throw new NotFoundError("user does not exist");

	await db.user.update({
		where: { id: userId },
		data: {
			deletedAt: new Date(),
			status: UserStatus.DELETED,
		},
	});

	await refreshTokenStore.revokeAll(userId);
};

export const followUser = async ({
	followerId,
	followingId,
}: {
	followerId: string;
	followingId: string;
}) => {
	if (followerId === followingId) {
		throw new BadRequestError("Cannot follow yourself");
	}

	const user = await db.user.findFirst({
		where: { id: followingId, deletedAt: null, status: UserStatus.ACTIVE },
		select: { id: true },
	});
	if (!user) {
		throw new NotFoundError("user not found");
	}

	return await db.follow.upsert({
		where: {
			followerId_followingId: { followerId, followingId },
		},
		update: {},
		create: { followerId, followingId },
	});
};

export const unfollowUser = async ({
	followerId,
	followingId,
}: {
	followerId: string;
	followingId: string;
}) => {
	return await db.follow.deleteMany({
		where: { followerId, followingId },
	});
};

export const getFollowers = async ({
	userId,
	page,
	limit,
}: {
	userId: string;
	page: number;
	limit: number;
}) => {
	return await db.follow.findMany({
		where: {
			followingId: userId,
			following: {
				deletedAt: null,
				status: UserStatus.ACTIVE,
			},
		},
		skip: (page - 1) * limit,
		take: limit,
		select: {
			follower: { select: { username: true } },
		},
	});
};

export const getFollowing = async ({
	userId,
	page,
	limit,
}: {
	userId: string;
	page: number;
	limit: number;
}) => {
	return await db.follow.findMany({
		where: {
			followerId: userId,
		},
		skip: (page - 1) * limit,
		take: limit,
		select: {
			following: { select: { username: true } },
		},
	});
};

export const isFollowing = async ({
	followerId,
	followingId,
}: {
	followerId: string;
	followingId: string;
}) => {
	const follow = await db.follow.findUnique({
		where: {
			followerId_followingId: {
				followerId,
				followingId,
			},
		},
		select: { followerId: true },
	});

	return !!follow;
};

export const userStats = async (userId: string) => {
	const result = await db.user.findFirst({
		where: {
			id: userId,
			status: UserStatus.ACTIVE,
			deletedAt: null,
		},
		select: {
			_count: {
				select: {
					followers: true,
					following: true,
					posts: true,
				},
			},
		},
	});

	if (!result) {
		throw new NotFoundError("user not found");
	}

	return result._count;
};
