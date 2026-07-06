import {
	createPostSchema,
	getAllPostsSchema,
	getPostBySlugSchema,
	getPublishedPostsSchema,
	postIdSchema,
	updatePostSchema,
} from "@modules/post/post.schema";
import {
	bookmarkPost,
	createPost,
	deletePost,
	getAuthorPostStats,
	getBookmarkedPosts,
	getPostById,
	getPostBySlug,
	getPosts,
	unbookmarkPost,
	updatePost,
} from "@modules/post/post.service";
import type { Request, Response } from "express";

export const createPostController = async (req: Request, res: Response) => {
	const createPostInput = createPostSchema.parse(req.body);

	const post = await createPost({
		authorId: req.user!.id,
		input: createPostInput,
	});

	res.status(201).json({
		post,
		message:
			post.status === "PUBLISHED"
				? "Post published successfully"
				: "Post saved as draft",
	});
};

export const getPublishedPostsController = async (
	req: Request,
	res: Response,
) => {
	const getPostsInput = getPublishedPostsSchema.parse(req.query);
	const { posts, meta } = await getPosts({
		...getPostsInput,
		status: "PUBLISHED",
	});

	res.status(200).json({
		posts,
		meta,
	});
};

export const getPostController = async (req: Request, res: Response) => {
	const { slug } = getPostBySlugSchema.parse(req.params);
	const post = await getPostBySlug(slug);

	res.status(200).json({
		post,
	});
};

export const getPostByIdController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);
	const post = await getPostById(id);

	res.status(200).json({
		post,
	});
};

export const getMyPostsController = async (req: Request, res: Response) => {
	const getPostsInput = getAllPostsSchema.parse(req.query);

	const { posts, meta } = await getPosts({
		...getPostsInput,
		authorId: req.user!.id,
	});

	res.status(200).json({
		posts,
		meta,
	});
};

export const getAuthorPostsController = async (req: Request, res: Response) => {
	const getPostsInput = getPublishedPostsSchema.parse(req.query);

	const { posts, meta } = await getPosts({
		...getPostsInput,
		status: "PUBLISHED",
		authorUsername: req.params.username as string,
	});

	res.status(200).json({
		posts,
		meta,
	});
};

export const getAllPostsController = async (req: Request, res: Response) => {
	const getPostsInput = getAllPostsSchema.parse(req.query);
	const { posts, meta } = await getPosts(getPostsInput);

	res.status(200).json({
		posts,
		meta,
	});
};

export const updatePostController = async (req: Request, res: Response) => {
	const updatePostInput = updatePostSchema.parse(req.body);
	const { id } = postIdSchema.parse(req.params);

	const post = await updatePost({
		authorId: req.user!.id,
		postId: id,
		input: updatePostInput,
	});

	res.status(200).json({
		post,
	});
};

export const deletePostController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);

	await deletePost(id);

	res.status(204);
};

export const getBookmarkedPostsController = async (
	req: Request,
	res: Response,
) => {
	const posts = await getBookmarkedPosts(req.user!.id);
	res.status(200).json({ posts });
};

export const bookmarkPostController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);

	await bookmarkPost({ userId: req.user!.id, postId: id });

	res.status(200).json({ message: "bookmarked", postId: id });
};

export const unbookmarkPostController = async (req: Request, res: Response) => {
	const { id } = postIdSchema.parse(req.params);

	await unbookmarkPost({ userId: req.user!.id, postId: id });

	res.status(200).json({ message: "un-bookmarked", postId: id });
};

export const getAuthorPostStatsController = async (
	req: Request,
	res: Response,
) => {
	const stats = await getAuthorPostStats(req.user!.id);

	res.status(200).json({ stats });
};
