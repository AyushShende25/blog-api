import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type {
  GetAllUsersInput,
  SavePostInput,
  UnsavePostInput,
  UpdateAvatarInput,
} from "@modules/users/users.schema";
import {
  getAllUsersService,
  getCurrentUserService,
  getSavedPostsService,
  savePostService,
  unsavePostService,
  updateAvatarService,
} from "@modules/users/users.service";

export const getCurrentUserHandler = async (req: Request, res: Response) => {
  const user = await getCurrentUserService(req.userId as string);
  res.status(StatusCodes.OK).json({ success: true, data: user });
};

export const getSavedPostsHandler = async (req: Request, res: Response) => {
  const savedPosts = await getSavedPostsService(req.userId as string);
  res.status(StatusCodes.OK).json({ success: true, data: savedPosts });
};

export const savePosthandler = async (
  req: Request<SavePostInput>,
  res: Response,
) => {
  await savePostService(req.userId as string, req.params.postId);
  res.status(StatusCodes.OK).json({ success: true, message: "saved post" });
};

export const unsavePostHandler = async (
  req: Request<UnsavePostInput>,
  res: Response,
) => {
  await unsavePostService(req.userId as string, req.params.postId);
  res.status(StatusCodes.OK).json({ success: true, message: "un-saved post" });
};

export const updateAvatarHandler = async (
  req: Request<{}, {}, UpdateAvatarInput>,
  res: Response,
) => {
  const user = await updateAvatarService(
    req.userId as string,
    req.body.avatarUrl,
  );
  res.status(StatusCodes.OK).json({ success: true, data: user });
};

export const getAllUsersHandler = async (
  req: Request<{}, {}, {}, GetAllUsersInput>,
  res: Response,
) => {
  console.log("Raw query:", req.query);
  console.log("Query keys:", Object.keys(req.query));
  console.log("Query values:", Object.values(req.query));
  const { users, meta } = await getAllUsersService(req.query);

  res.status(StatusCodes.OK).json({ success: true, data: users, meta });
};
