import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { CreatePostInput } from "@modules/post/post.schema";
import { createPostService } from "@modules/post/post.service";

export const createPostHandler = async (
  req: Request<{}, {}, CreatePostInput>,
  res: Response,
) => {
  const post = await createPostService(req.body, req.userId as string);
  res.status(StatusCodes.CREATED).json({
    post,
  });
};

export const listPostsHandler = async (req: Request, res: Response) => {};

export const getPostHandler = async (req: Request, res: Response) => {};

export const updatePostHandler = async (req: Request, res: Response) => {};

export const deletePostHandler = async (req: Request, res: Response) => {};
