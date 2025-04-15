import prisma from "@/config/db";

export const getFiveCategoriesWithHighestPostCountService = async () => {
  return prisma.category.findMany({
    take: 5,
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
  });
};

export const getAllCategoriesService = async () => {
  return prisma.category.findMany();
};
