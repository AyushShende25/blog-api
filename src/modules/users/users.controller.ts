import {
	deleteMe,
	deleteUser,
	followUser,
	getAllUsers,
	getFollowers,
	getFollowing,
	getMe,
	unfollowUser,
	updateMe,
	updateUser,
} from "@modules/users/users.service";
import type { Request, Response } from "express";
import {
	followSchema,
	getAllUsersSchema,
	updateMeSchema,
	updateUserSchema,
	userIdSchema,
} from "./users.schema";

export const getMyAccountController = async (req: Request, res: Response) => {
	const user = await getMe(req.user!.id);
	res.status(200).json({ user });
};

export const updateMyAccountController = async (
	req: Request,
	res: Response,
) => {
	const input = updateMeSchema.parse(req.body);

	const updatedUser = await updateMe({ userId: req.user!.id, input });

	res.status(200).json({ user: updatedUser });
};

export const deleteMyAccountController = async (
	req: Request,
	res: Response,
) => {
	await deleteMe(req.user!.id);

	res.clearCookie("access_token");
	res.clearCookie("refresh_token");
	res.status(204).send();
};

export const getUsersController = async (req: Request, res: Response) => {
	const input = getAllUsersSchema.parse(req.query);

	const { users, meta } = await getAllUsers(input);

	res.status(200).json({ users, meta });
};

export const updateUserController = async (req: Request, res: Response) => {
	const { id } = userIdSchema.parse(req.params);
	const input = updateUserSchema.parse(req.body);

	const updatedUser = await updateUser({ userId: id, input });

	res.status(200).json({ user: updatedUser });
};

export const deleteUserController = async (req: Request, res: Response) => {
	const { id } = userIdSchema.parse(req.params);

	await deleteUser(id);

	res.status(204).send();
};

export const followUserController = async (req: Request, res: Response) => {
	const { id } = userIdSchema.parse(req.params);

	await followUser({
		followerId: req.user!.id,
		followingId: id,
	});

	res.status(200).json({ message: "following user successfully" });
};

export const unfollowUserController = async (req: Request, res: Response) => {
	const { id } = userIdSchema.parse(req.params);

	await unfollowUser({
		followerId: req.user!.id,
		followingId: id,
	});

	res.status(200).json({ message: "un-following user successfully" });
};

export const getMyFollowersController = async (req: Request, res: Response) => {
	const { page, limit } = followSchema.parse(req.query);

	const followers = await getFollowers({ userId: req.user!.id, page, limit });

	res.status(200).json({ followers });
};

export const getUserFollowersController = async (
	req: Request,
	res: Response,
) => {
	const { id } = userIdSchema.parse(req.params);
	const { page, limit } = followSchema.parse(req.query);

	const followers = await getFollowers({ userId: id, page, limit });

	res.status(200).json({ followers });
};

export const getMyFollowingController = async (req: Request, res: Response) => {
	const { page, limit } = followSchema.parse(req.query);

	const following = await getFollowing({ userId: req.user!.id, page, limit });

	res.status(200).json({ following });
};

export const getUserFollowingController = async (
	req: Request,
	res: Response,
) => {
	const { id } = userIdSchema.parse(req.params);
	const { page, limit } = followSchema.parse(req.query);

	const following = await getFollowing({ userId: id, page, limit });

	res.status(200).json({ following });
};
