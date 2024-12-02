import slugify from "slugify";

import prisma from "@/config/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/errors";
import type {
  CreatePostInput,
  GetPostInput,
  UpdatePostInput,
} from "@modules/post/post.schema";

export const createPostService = async (
  createPostInput: CreatePostInput,
  authorId: string,
) => {
  const { categories, content, title, images, status } = createPostInput;
  const slug = slugify(title, { lower: true });
  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        authorId,
        categories: {
          connectOrCreate: categories?.map((category) => ({
            where: { name: category },
            create: { name: category },
          })),
        },
        images,
        status,
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

export const listPostsService = async () => {
  return await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { categories: true, author: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getPostBySlugService = async (getPostInput: GetPostInput) => {
  const post = await prisma.post.findFirst({
    where: { slug: getPostInput.slug },
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
