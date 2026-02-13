import { Prisma } from "generated/prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";

export const getTags = async (search?: string) => {
	return await db.tag.findMany({
		where: search
			? { name: { contains: search, mode: "insensitive" } }
			: undefined,
		orderBy: { name: "asc" },
	});
};

export const createTag = async (name: string) => {
	try {
		return await db.tag.create({ data: { name } });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new ConflictError("tag already exists");
			}
		}
		throw error;
	}
};

export const updateTag = async ({ id, name }: { id: string; name: string }) => {
	const tag = await db.tag.findUnique({
		where: { id },
	});

	if (!tag) {
		throw new NotFoundError("tag does not exist");
	}

	try {
		return await db.tag.update({ where: { id }, data: { name } });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new ConflictError("tag already exists");
			}
		}
		throw error;
	}
};

export const deleteTag = async (id: string) => {
	const tag = await db.tag.findUnique({
		where: { id },
		include: { posts: { take: 1 } },
	});

	if (!tag) {
		throw new NotFoundError("tag does not exist");
	}

	if (tag.posts.length > 0) {
		throw new BadRequestError("Tag is in use");
	}

	await db.tag.delete({
		where: { id },
	});
};
