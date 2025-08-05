import prisma from "@/config/db";
import { NotFoundError, UnAuthorizedError } from "@/errors";
import { findPostByIdService } from "@modules/post/post.service";
import type { Prisma } from "@prisma/client";
import type { GetAllUsersInput } from "./users.schema";

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

export const updateAvatarService = async (
  userId: string,
  newAvatarUrl: string,
) => {
  const user = await findUserbyId(userId);
  if (!user) {
    throw new NotFoundError("user not found");
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: newAvatarUrl },
    omit: {
      password: true,
    },
  });
  return updatedUser;
};

export const getAllUsersService = async (
  getAllUsersInput: GetAllUsersInput,
) => {
  const { limit, page, filter } = getAllUsersInput;

  const limitNum = Number.parseInt(limit) || 10;
  const pageNum = Number.parseInt(page) || 1;
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.UserWhereInput = filter
    ? {
        OR: [
          { username: { contains: filter, mode: "insensitive" } },
          { email: { contains: filter, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limitNum,
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const meta = {
    page,
    limit,
    totalPages: Math.ceil(total / limitNum),
    totalItems: total,
    hasNextPage: pageNum < Math.ceil(total / limitNum),
    hasPreviousPage: pageNum > 1,
  };

  return { users, meta };
};
