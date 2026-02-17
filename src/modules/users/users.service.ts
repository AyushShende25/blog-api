import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Prisma } from "generated/prisma/client";
import { UserStatus } from "generated/prisma/enums";
import { env } from "@/config/env";
import { ConflictError, NotFoundError } from "@/errors";
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
	const user = await db.user.findFirst({
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
	const user = await db.user.findFirst({
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
