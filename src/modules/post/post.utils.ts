import { randomBytes } from "node:crypto";
import type { Prisma } from "generated/prisma/client";
import type { PostStatus } from "generated/prisma/enums";
import sanitizeHtml from "sanitize-html";
import slugify from "slugify";
import { db } from "@/libs/db";

export const generateExcerpt = (content: string, maxLength: number): string => {
	const plainText = content
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (plainText.length <= maxLength) return plainText;
	return plainText.substring(0, maxLength).trim() + "...";
};

export const sanitizeContent = (content: string) => {
	return sanitizeHtml(content, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat([
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"img",
			"span",
			"pre",
			"code",
			"figure",
			"figcaption",
		]),
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			"*": ["class", "id"],
			img: ["src", "alt", "width", "height"],
			a: ["href", "target", "rel"],
			code: ["class"],
		},
		allowedClasses: {
			"*": ["*"],
		},
		allowedSchemes: ["http", "https", "mailto"],
	});
};

export const buildOrderby = (
	sort: string,
): Prisma.PostOrderByWithRelationInput[] => {
	const [field, order] = sort.split(":");

	// Whitelist allowed sort fields for security
	const allowedFields = ["createdAt", "updatedAt", "title", "publishedAt"];

	if (!allowedFields.includes(field)) {
		return [{ createdAt: "desc" }];
	}
	const orderDirection = order === "asc" ? "asc" : "desc";

	return [{ [field]: orderDirection }, { createdAt: "desc" }];
};

type WhereParams = {
	status?: PostStatus;
	category?: string[];
	tag?: string[];
	search?: string;
	includeDeleted?: boolean;
	authorId?: string;
	authorUsername?: string;
	dateFrom?: Date;
	dateTo?: Date;
};

export const buildWhereClause = ({
	status,
	search,
	category,
	tag,
	includeDeleted,
	authorId,
	authorUsername,
	dateFrom,
	dateTo,
}: WhereParams): Prisma.PostWhereInput => {
	const where: Prisma.PostWhereInput = {};

	if (!includeDeleted) {
		where.deletedAt = null;
	}

	if (status) {
		where.status = { equals: status };
	}

	if (category?.length) {
		where.categories = {
			some: { name: { in: category } },
		};
	}
	if (tag?.length) {
		where.tags = {
			some: { name: { in: tag } },
		};
	}

	if (authorId) {
		where.authorId = { equals: authorId };
	}

	if (authorUsername) {
		where.author = {
			username: { equals: authorUsername, mode: "insensitive" },
		};
	}

	if (dateFrom || dateTo) {
		where.publishedAt = {};
		if (dateFrom) {
			where.publishedAt.gte = dateFrom;
		}
		if (dateTo) {
			where.publishedAt.lte = dateTo;
		}
	}

	if (search) {
		where.OR = [
			{ title: { contains: search, mode: "insensitive" } },
			{
				content: { contains: search, mode: "insensitive" },
			},
			{ excerpt: { contains: search, mode: "insensitive" } },
			{
				tags: {
					some: {
						name: { contains: search, mode: "insensitive" },
					},
				},
			},
		];
	}

	return where;
};

export const generateUniqueSlug = async ({
	title,
	excludePostId,
	maxRetries = 5,
}: {
	title: string;
	excludePostId?: string;
	maxRetries?: number;
}) => {
	const baseSlug = slugify(title, { lower: true, strict: true });
	if (!baseSlug) throw new Error("Invalid title");

	for (let i = 0; i < maxRetries; i++) {
		const slug = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
		const exists = await db.post.findFirst({
			where: { slug, ...(excludePostId ? { id: { not: excludePostId } } : {}) },
			select: { id: true },
		});

		if (!exists) {
			return slug;
		}
	}
	const randomId = randomBytes(6).toString("hex");
	return `${baseSlug}-${randomId}`;
};
