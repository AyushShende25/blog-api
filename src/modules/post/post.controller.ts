import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type {
  CreatePostInput,
  DeletePostInput,
  GetPostInput,
  GetUserPostsInput,
  ListPostsInput,
  UpdatePostInput,
} from "@modules/post/post.schema";
import {
  createPostService,
  deletePostService,
  getPostBySlugService,
  getUserPostsService,
  listPostsService,
  updatePostService,
} from "@modules/post/post.service";
import type { Role } from "@prisma/client";

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

export const listPostsHandler = async (
  req: Request<{}, {}, {}, ListPostsInput>,
  res: Response,
) => {
  const { posts, meta } = await listPostsService(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: posts,
    meta,
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
    req.role as Role,
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
  await deletePostService(
    req.params.postId,
    req.userId as string,
    req.role as Role,
  );

  res.status(StatusCodes.NO_CONTENT).json();
};

export const getUserPosts = async (
  req: Request<{}, {}, {}, GetUserPostsInput>,
  res: Response,
) => {
  const posts = await getUserPostsService(
    req.userId as string,
    req.query.status,
  );
  res.status(StatusCodes.OK).json({
    success: true,
    data: posts,
  });
};
