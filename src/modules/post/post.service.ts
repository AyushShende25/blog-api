import slugify from "slugify";

import prisma from "@/config/db";
import { BadRequestError, NotFoundError } from "@/errors";
import type {
  CreatePostInput,
  GetPostInput,
  ListPostsInput,
  UpdatePostInput,
} from "@modules/post/post.schema";
import {
  buildOrderby,
  buildWhereClause,
  checkPostAuthorization,
  parseAndValidatePagination,
  sanitizeContent,
} from "@modules/post/post.utils";
import type { PostStatus, Role } from "@prisma/client";

const POST_INCLUDE_CONFIG = {
  categories: true,
  author: { select: { username: true, id: true } },
} as const;

export const createPostService = async (
  createPostInput: CreatePostInput,
  authorId: string,
) => {
  const { categories, content, title, images, status, coverImage } =
    createPostInput;

  const slug = slugify(title, { lower: true });
  const existingSlug = await prisma.post.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new BadRequestError("A post with a similar slug already exists");
  }

  const sanitizedContent = sanitizeContent(content ?? "");

  const newPost = await prisma.post.create({
    data: {
      title,
      content: sanitizedContent,
      slug,
      authorId,
      categories: {
        connect: categories?.map((id) => ({ id })),
      },
      images,
      status,
      coverImage,
    },
    include: POST_INCLUDE_CONFIG,
  });
  return newPost;
};

export const listPostsService = async (listPostsInput: ListPostsInput) => {
  const { page, limit, category, filter, sort } = listPostsInput;

  // Parse pagination parameters
  const { pageNum, limitNum, skip } = parseAndValidatePagination(page, limit);

  // Build query conditions
  const orderBy = buildOrderby(sort);
  const where = buildWhereClause(category, filter);

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limitNum,
      where,
      include: {
        categories: { select: { name: true } },
        author: { select: { username: true } },
      },
      orderBy,
    }),
    prisma.post.count({ where }),
  ]);

  const meta = {
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    totalItems: total,
    hasNextPage: pageNum < Math.ceil(total / limitNum),
    hasPreviousPage: pageNum > 1,
  };

  return { posts, meta };
};

export const updatePostService = async (
  postId: string,
  authorId: string,
  userRole: Role,
  updatePostInput: UpdatePostInput["body"],
) => {
  const existingPost = await findPostById(postId);
  if (!existingPost) {
    throw new NotFoundError("post does not exist");
  }

  checkPostAuthorization(existingPost, authorId, userRole, "update");

  const { title, categories, content, ...otherFields } = updatePostInput;

  const slug = title ? slugify(title, { lower: true }) : undefined;
  if (slug && slug !== existingPost.slug) {
    const existingSlug = await prisma.post.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new BadRequestError("A post with a similar slug already exists");
    }
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      ...otherFields,
      slug,
      content: content ? sanitizeContent(content) : undefined,
      categories: categories
        ? { connect: categories?.map((id) => ({ id })) }
        : undefined,
    },
    include: POST_INCLUDE_CONFIG,
  });

  return updatedPost;
};

export const deletePostService = async (
  postId: string,
  authorId: string,
  userRole: Role,
) => {
  const existingPost = await findPostById(postId);
  if (!existingPost) {
    throw new NotFoundError("post does not exist");
  }

  checkPostAuthorization(existingPost, authorId, userRole, "delete");

  const deletedPost = await prisma.post.delete({
    where: { id: postId },
  });

  return deletedPost;
};

const findPostById = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      categories: true,
      author: { select: { username: true } },
    },
  });
  if (!post) {
    throw new NotFoundError("post not found");
  }
  return post;
};

export const getPostBySlugService = async (getPostInput: GetPostInput) => {
  const post = await prisma.post.findUnique({
    where: { slug: getPostInput.slug },
    include: {
      categories: true,
      author: { select: { username: true } },
    },
  });
  if (!post) {
    throw new NotFoundError("post not found");
  }
  return post;
};

export const getUserPostsService = async (
  authorId: string,
  status: PostStatus,
) => {
  const posts = await prisma.post.findMany({
    where: { status, authorId },
    include: { categories: true },
  });

  return posts;
};
