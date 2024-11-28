import slugify from "slugify";

import prisma from "@/config/db";
import { BadRequestError, NotFoundError } from "@/errors";
import type { CreatePostInput, GetPostInput } from "@modules/post/post.schema";

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
