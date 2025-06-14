import prisma from "@/config/db";
import { NotFoundError, UnAuthorizedError } from "@/errors";
import { findPostByIdService } from "@modules/post/post.service";

export const getCurrentUserService = async (userId: string) => {
  const user = await findUserbyId(userId);
  if (!user) {
    throw new UnAuthorizedError();
  }
  return user;
};

export const findUserbyEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserbyId = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    omit: {
      password: true,
    },
  });
};

export const getSavedPostsService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { savedPosts: true },
  });
  if (!user) {
    throw new UnAuthorizedError();
  }

  return user?.savedPosts ?? [];
};

export const savePostService = async (userId: string, postId: string) => {
  const post = await findPostByIdService(postId);
  if (!post) throw new NotFoundError("Post not found");

  await prisma.user.update({
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

export const unsavePostService = async (userId: string, postId: string) => {
  const post = await findPostByIdService(postId);
  if (!post) throw new NotFoundError("Post not found");

  await prisma.user.update({
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
