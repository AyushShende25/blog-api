import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type {
  SavePostInput,
  UnsavePostInput,
} from "@modules/users/users.schema";
import {
  getCurrentUserService,
  getSavedPostsService,
  savePostService,
  unsavePostService,
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
