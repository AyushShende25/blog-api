import type {
	CreatePostInput,
	GetAllPostsInput,
	UpdatePostInput,
} from "@modules/post/post.schema";
import {
	buildOrderby,
	buildWhereClause,
	generateExcerpt,
	generateUniqueSlug,
	sanitizeContent,
} from "@modules/post/post.utils";
import { PostStatus } from "generated/prisma/enums";
import { BadRequestError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";

const POST_INCLUDE_CONFIG = {
	categories: true,
	tags: true,
	media: { select: { id: true, url: true, type: true } },
	author: { select: { username: true, avatar: true } },
} as const;

export const createPost = async ({
	authorId,
	input,
}: {
	authorId: string;
	input: CreatePostInput;
}) => {
	const { title, content, categories, media, tags, ...rest } = input;

	const slug = await generateUniqueSlug({ title });

	const [categoryIds, tagIds, mediaIds] = await Promise.all([
		db.category.findMany({
			where: {
				id: { in: categories },
			},
			select: { id: true },
		}),
		db.tag.findMany({
			where: {
				id: { in: tags },
			},
			select: { id: true },
		}),
		media?.length
			? db.media.findMany({
					where: { id: { in: media }, uploaderId: authorId, postId: null },
					select: { id: true },
				})
			: [],
	]);

	if (categoryIds.length !== categories.length) {
		throw new BadRequestError("One or more categories are invalid");
	}
	if (tagIds.length !== tags.length) {
		throw new BadRequestError("One or more tags are invalid");
	}
	if (media?.length && mediaIds.length !== media.length) {
		throw new BadRequestError(
			"Some media files are unavailable or already linked to other posts",
		);
	}

	const cleanContent = sanitizeContent(content);
	const excerpt = rest.excerpt ?? generateExcerpt(cleanContent, 150);

	return db.post.create({
		data: {
			...rest,
			title,
			slug,
			content: cleanContent,
			authorId,
			excerpt,
			metaTitle: rest.metaTitle ?? title,
			metaDescription: rest.metaDescription ?? excerpt,
			categories: {
				connect: categoryIds.map((c) => ({ id: c.id })),
			},
			tags: {
				connect: tagIds.map((t) => ({ id: t.id })),
			},
			media: mediaIds.length
				? { connect: mediaIds.map((m) => ({ id: m.id })) }
				: undefined,
			publishedAt:
				rest.status === PostStatus.PUBLISHED
					? rest.publishAt || new Date()
					: null,
		},
		include: POST_INCLUDE_CONFIG,
	});
};

export const getPosts = async (input: GetAllPostsInput) => {
	const { page, limit, sort, authorId, authorUsername, ...filters } = input;

	if (authorId && authorUsername) {
		throw new BadRequestError("invalid author filter");
	}

	// Build query conditions
	const orderBy = buildOrderby(sort);
	const where = buildWhereClause({
		...filters,
		authorId,
		authorUsername,
	});

	const [posts, total] = await Promise.all([
		db.post.findMany({
			skip: (page - 1) * limit,
			take: limit,
			where,
			include: {
				categories: { select: { id: true, name: true } },
				tags: { select: { id: true, name: true } },
				author: { select: { username: true, avatar: true } },
				_count: { select: { likes: true, comments: true } },
			},
			orderBy,
		}),
		db.post.count({ where }),
	]);

	const totalPages = Math.ceil(total / limit);

	return {
		posts,
		meta: {
			page,
			limit,
			totalPages,
			totalItems: total,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
	};
};

export const getPostBySlug = async (slug: string) => {
	const post = await db.post.findFirst({
		where: { slug, status: PostStatus.PUBLISHED, deletedAt: null },
		include: {
			...POST_INCLUDE_CONFIG,
			_count: { select: { likes: true } },
		},
	});
	if (!post) {
		throw new NotFoundError("post not found");
	}
	return post;
};

export const getPostById = async (id: string) => {
	const post = await db.post.findFirst({
		where: { id, deletedAt: null },
	});
	if (!post) {
		throw new NotFoundError("post not found");
	}
	return post;
};

export const updatePost = async ({
	authorId,
	postId,
	input,
}: {
	authorId: string;
	postId: string;
	input: UpdatePostInput;
}) => {
	const existingPost = await db.post.findUnique({
		where: { id: postId },
		select: { title: true, content: true },
	});

	if (!existingPost) throw new NotFoundError("Post not found");

	const { categories, content, title, media, tags, status, ...rest } = input;

	const [categoryIds, mediaIds] = await Promise.all([
		categories
			? db.category.findMany({
					where: { id: { in: categories } },
					select: { id: true },
				})
			: Promise.resolve(null),
		media?.length
			? db.media.findMany({
					where: {
						id: { in: media },
						uploaderId: authorId,
						OR: [{ postId: null }, { postId }],
					},
					select: { id: true },
				})
			: Promise.resolve(null),
	]);
	if (categories && categoryIds?.length !== categories.length) {
		throw new BadRequestError("One or more categories are invalid");
	}

	if (media?.length && mediaIds?.length !== media.length) {
		throw new BadRequestError(
			"Some media files are unavailable or already linked to other posts",
		);
	}

	const cleanContent =
		content !== undefined ? sanitizeContent(content) : undefined;

	const excerpt =
		content !== undefined
			? (rest.excerpt ?? generateExcerpt(cleanContent!, 150))
			: rest.excerpt;

	const finalTitle = title ?? existingPost.title;
	const finalContent = cleanContent ?? existingPost.content;

	if (status === PostStatus.PUBLISHED) {
		if (!finalTitle?.trim() || !finalContent?.trim()) {
			throw new BadRequestError("Title and content are required to publish");
		}
	}

	return await db.post.update({
		where: { id: postId },
		data: {
			...rest,
			title,
			slug: title
				? await generateUniqueSlug({ title, excludePostId: postId })
				: undefined,
			content: cleanContent,
			excerpt,
			status,
			metaTitle:
				rest.metaTitle !== undefined
					? rest.metaTitle
					: title !== undefined
						? title
						: undefined,
			metaDescription:
				rest.metaDescription !== undefined
					? rest.metaDescription
					: excerpt !== undefined
						? excerpt
						: undefined,
			categories: categoryIds
				? {
						set: categoryIds.map((c) => ({ id: c.id })),
					}
				: undefined,
			media:
				mediaIds !== null
					? {
							set: mediaIds.map((m) => ({ id: m.id })),
						}
					: undefined,
			tags: tags
				? {
						set: [],
						connectOrCreate: tags.map((tag) => ({
							where: { name: tag },
							create: { name: tag },
						})),
					}
				: undefined,
			publishedAt:
				status === PostStatus.PUBLISHED
					? rest.publishAt || new Date()
					: status === PostStatus.DRAFT
						? null
						: undefined,
		},
		include: POST_INCLUDE_CONFIG,
	});
};

export const deletePost = async (postId: string) => {
	return await db.post.update({
		where: { id: postId },
		data: { deletedAt: new Date() },
	});
};

export const getBookmarkedPosts = async (userId: string) => {
	return await db.post.findMany({
		where: {
			savedBy: {
				some: { id: userId },
			},
			status: PostStatus.PUBLISHED,
			deletedAt: null,
		},
		include: {
			author: { select: { username: true, avatar: true } },
			categories: true,
			tags: true,
		},
	});
};

export const bookmarkPost = async ({
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

	return await db.user.update({
		where: { id: userId },
		data: {
			savedPosts: {
				connect: {
					id: postId,
				},
			},
		},
	});
};

export const unbookmarkPost = async ({
	userId,
	postId,
}: {
	userId: string;
	postId: string;
}) => {
	return await db.user.update({
		where: { id: userId },
		data: {
			savedPosts: {
				disconnect: {
					id: postId,
				},
			},
		},
	});
};
