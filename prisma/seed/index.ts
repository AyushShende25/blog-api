import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { seedData as data } from "./data";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Seeding database...");

	// Delete in dependency order
	await prisma.follow.deleteMany();
	await prisma.like.deleteMany();
	await prisma.comment.deleteMany();
	await prisma.media.deleteMany();
	await prisma.post.deleteMany();
	await prisma.category.deleteMany();
	await prisma.tag.deleteMany();
	await prisma.passwordResetToken.deleteMany();
	await prisma.verificationToken.deleteMany();
	await prisma.user.deleteMany();

	//
	// Users
	//
	await prisma.user.createMany({
		data: data.users,
	});

	//
	// Categories
	//
	await prisma.category.createMany({
		data: data.categories,
	});

	//
	// Tags
	//
	await prisma.tag.createMany({
		data: data.tags,
	});

	//
	// Posts
	//
	await prisma.post.createMany({
		data: data.posts,
	});

	//
	// Verification Tokens
	//
	await prisma.verificationToken.createMany({
		data: data.verificationTokens,
	});

	//
	// Password Reset Tokens
	//
	await prisma.passwordResetToken.createMany({
		data: data.passwordResetTokens,
	});

	//
	// Media
	//
	await prisma.media.createMany({
		data: data.media,
	});

	//
	// Comments
	//
	await prisma.comment.createMany({
		data: data.comments,
	});

	//
	// Likes
	//
	await prisma.like.createMany({
		data: data.likes,
	});

	//
	// Follows
	//
	await prisma.follow.createMany({
		data: data.follows,
	});

	//
	// Many-to-many relations
	//
	for (const relation of data.postCategories) {
		await prisma.post.update({
			where: {
				id: relation.postId,
			},
			data: {
				categories: {
					connect: {
						id: relation.categoryId,
					},
				},
			},
		});
	}

	for (const relation of data.postTags) {
		await prisma.post.update({
			where: {
				id: relation.postId,
			},
			data: {
				tags: {
					connect: {
						id: relation.tagId,
					},
				},
			},
		});
	}

	console.log("Database seeded!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
