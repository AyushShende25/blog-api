import slugify from "slugify";

import prisma from "@/config/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/errors";
import type {
  CreatePostInput,
  GetPostInput,
  ListPostsInput,
  UpdatePostInput,
} from "@modules/post/post.schema";
import { PostStatus } from "@prisma/client";

export const createPostService = async (
  createPostInput: CreatePostInput,
  authorId: string,
) => {
  const { categories, content, title, images, status, coverImage } =
    createPostInput;
  const slug = slugify(title, { lower: true });
  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content: content ?? "",
        slug,
        authorId,
        categories: {
          connect: categories?.map((id) => ({ id })),
        },
        images,
        status,
        coverImage,
      },
      include: {
        categories: true,
        author: { select: { username: true } },
      },
    });
    return newPost;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new BadRequestError("A post with a similar slug already exists.");
    }
    throw error;
  }
};

export const listPostsService = async (listPostsInput: ListPostsInput) => {
  const { page = "1", limit = "10", category, filter, sort } = listPostsInput;

  // Pagination
  const pageNum = Number.parseInt(page as string) || 1;
  const limitNum = Number.parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  let orderBy = {};
  if (sort) {
    const [field, order] = sort.split(":");
    orderBy = { [field]: order === "desc" ? "desc" : "asc" };
  } else {
    orderBy = { createdAt: "desc" };
  }

  // Filtering
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const where: any = {};
  if (category) {
    where.categories = {
      some: { name: { mode: "insensitive", equals: category } },
    };
  }
  if (filter) {
    where.OR = [
      { title: { contains: filter, mode: "insensitive" } },
      {
        content: { contains: filter, mode: "insensitive" },
      },
    ];
  }
  const posts = await prisma.post.findMany({
    skip,
    take: limitNum,
    where: { ...where, status: PostStatus.PUBLISHED },
    include: {
      categories: { select: { name: true } },
      author: { select: { username: true } },
    },
    orderBy,
  });
  const total = await prisma.post.count({
    where: { ...where, status: PostStatus.PUBLISHED },
  });
  const meta = {
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    totalItems: total,
  };
  return { posts, meta };
};

export const getPostBySlugService = async (getPostInput: GetPostInput) => {
  const post = await prisma.post.findFirst({
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

export const updatePostService = async (
  postId: string,
  authorId: string,
  updatePostInput: UpdatePostInput["body"],
) => {
  const existingPost = await findPostById(postId);
  if (!existingPost) {
    throw new NotFoundError("post does not exist");
  }

  if (existingPost.authorId !== authorId) {
    throw new ForbiddenError("you are not allowed to update this post");
  }

  const { title, categories } = updatePostInput;
  const slug = title ? slugify(title, { lower: true }) : undefined;

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      ...updatePostInput,
      slug,
      categories: categories
        ? {
            disconnect: existingPost.categories.map((category) => ({
              id: category.id,
            })),
            connectOrCreate: categories?.map((category) => ({
              where: { name: category },
              create: { name: category },
            })),
          }
        : undefined,
    },
    include: {
      categories: true,
    },
  });

  return updatedPost;
};

export const deletePostService = async (postId: string, authorId: string) => {
  const existingPost = await findPostById(postId);
  if (!existingPost) {
    throw new NotFoundError("post does not exist");
  }

  if (existingPost.authorId !== authorId) {
    throw new ForbiddenError("you are not allowed to delete this post");
  }

  const deletedPost = await prisma.post.delete({
    where: { id: postId },
  });

  return deletedPost;
};

const findPostById = async (postId: string) => {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      categories: true,
      author: { select: { username: true } },
    },
  });
};
