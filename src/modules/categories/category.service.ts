import { Prisma } from "generated/prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";

export const getAllCategories = async () => {
	return db.category.findMany({ orderBy: { name: "asc" } });
};

export const createCategory = async (name: string) => {
	try {
		return await db.category.create({
			data: { name },
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new ConflictError("category already exists");
			}
		}
		throw error;
	}
};

export const updateCategory = async ({
	id,
	name,
}: {
	id: string;
	name: string;
}) => {
	try {
		const category = await db.category.findUnique({
			where: { id },
		});

		if (!category) {
			throw new NotFoundError("Category does not exist");
		}

		return await db.category.update({
			where: { id },
			data: { name },
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new ConflictError("category already exists");
			}
		}
		throw error;
	}
};

export const deleteCategory = async (id: string) => {
	const category = await db.category.findUnique({
		where: { id },
		include: { posts: { take: 1 } },
	});

	if (!category) {
		throw new NotFoundError("Category does not exist");
	}

	if (category.posts.length > 0) {
		throw new BadRequestError("Category is in use");
	}

	await db.category.delete({ where: { id } });
};
