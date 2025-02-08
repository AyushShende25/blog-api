import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type {
  CreatePostInput,
  DeletePostInput,
  GetPostInput,
  UpdatePostInput,
} from "@modules/post/post.schema";
import {
  createPostService,
  deletePostService,
  getPostBySlugService,
  listPostsService,
  updatePostService,
} from "@modules/post/post.service";

export const createPostHandler = async (
  req: Request<{}, {}, CreatePostInput>,
  res: Response,
) => {
  const post = await createPostService(req.body, req.userId as string);
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: post,
  });
};

export const listPostsHandler = async (req: Request, res: Response) => {
  const posts = await listPostsService();

  res.status(StatusCodes.OK).json({
    success: true,
    data: posts,
  });
};

export const getPostHandler = async (
  req: Request<GetPostInput>,
  res: Response,
) => {
  const post = await getPostBySlugService(req.params);

  res.status(StatusCodes.OK).json({
    success: true,
    data: post,
  });
};

export const updatePostHandler = async (
  req: Request<UpdatePostInput["params"], {}, UpdatePostInput["body"]>,
  res: Response,
) => {
  const post = await updatePostService(
    req.params.postId,
    req.userId as string,
    req.body,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: post,
  });
};

export const deletePostHandler = async (
  req: Request<DeletePostInput>,
  res: Response,
) => {
  await deletePostService(req.params.postId, req.userId as string);

  res.status(StatusCodes.NO_CONTENT).json();
};
