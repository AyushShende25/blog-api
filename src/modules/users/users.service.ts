import prisma from "@/config/db";
import { UnAuthorizedError } from "@/errors";

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
