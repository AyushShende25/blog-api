import prisma from "@/config/db";
import type { Prisma } from "@prisma/client";

export const createUser = async (newUser: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data: {
      email: newUser.email,
      username: newUser.username,
      password: newUser.password,
    },
  });
};

export const verifyUser = async (userId: string) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isVerified: true,
    },
  });
};
