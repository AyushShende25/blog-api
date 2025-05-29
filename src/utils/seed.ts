import { PostStatus, PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

import * as data from "./seedData.json";

const prisma = new PrismaClient();

// Define types to match the JSON structure
type UserData = {
  email: string;
  username: string;
  password: string;
  role: keyof typeof Role;
  isVerified: boolean;
};

type PostData = {
  title: string;
  content: string;
  slug: string;
  status: keyof typeof PostStatus;
  categories: string[];
  images: string[];
};

// Type assertion for imported data
const userData = data.users as UserData[];
const postsData = data.posts as PostData[];

async function main() {
  try {
    // Clear existing data
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log("Existing data cleared");

    // Create categories first
    const categories = await Promise.all(
      data.categories.map((category) =>
        prisma.category.create({
          data: {
            name: category.name,
          },
        }),
      ),
    );

    console.log("Categories created:", categories.length);

    // Create users with hashed passwords
    const users = await Promise.all(
      userData.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return prisma.user.create({
          data: {
            email: user.email,
            username: user.username,
            password: hashedPassword,
            role: Role[user.role], // Convert string to enum
            isVerified: user.isVerified,
          },
        });
      }),
    );

    console.log("Users created:", users.length);

    // Create posts with random authors and proper category connections
    const posts = await Promise.all(
      postsData.map(async (post, index) => {
        // Assign posts to users in a round-robin fashion
        const authorId = users[index % users.length].id;

        // Find category IDs for this post
        const postCategories = categories
          .filter((cat) => post.categories.includes(cat.name))
          .map((cat) => ({ id: cat.id }));

        return prisma.post.create({
          data: {
            title: post.title,
            content: post.content,
            slug: post.slug,
            status: PostStatus[post.status as keyof typeof PostStatus], // Convert string to enum
            images: post.images,
            authorId: authorId,
            categories: {
              connect: postCategories,
            },
          },
        });
      }),
    );

    console.log("Posts created:", posts.length);
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
