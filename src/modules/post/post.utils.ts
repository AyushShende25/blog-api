import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Request, Response } from "express";
import sanitizeHtml from "sanitize-html";

import { env } from "@/config/env";
import { s3 } from "@/config/s3";
import { ForbiddenError } from "@/errors";
import type { GeneratePresignedUrlInput } from "@modules/post/post.schema";
import { PostStatus, type Prisma, Role } from "@prisma/client";

export const generatePresignedUrl = async (
  req: Request<{}, {}, GeneratePresignedUrlInput>,
  res: Response,
) => {
  const { filename, filetype } = req.body;
  const uniquePrefix = randomUUID();
  const fileKey = `postimages/${uniquePrefix}-${filename}`;

  const BUCKET_NAME = env.AWS_S3_BUCKET_NAME;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: filetype,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  const fileLink = `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileKey}`;

  res.json({ success: true, data: { fileLink, url } });
};

export const sanitizeContent = (content: string) => {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "span",
      "pre",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "style"],
      img: ["src", "alt", "width", "height"],
    },
    allowedClasses: {
      "*": ["*"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parseAndValidatePagination = (page: string, limit: string) => {
  const pageNum = Math.max(1, Number.parseInt(page) || DEFAULT_PAGE);
  const limitNum = Math.min(Number.parseInt(limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
};

export const buildOrderby = (
  sort?: string,
): Prisma.PostOrderByWithRelationInput => {
  if (!sort) {
    return { createdAt: "desc" };
  }

  const [field, order] = sort.split(":");

  // Whitelist allowed sort fields for security
  const allowedFields = ["createdAt", "updatedAt", "title", "content"];
  if (!allowedFields.includes(field)) {
    return { createdAt: "desc" };
  }

  return { [field]: order === "desc" ? "desc" : "asc" };
};

export const buildWhereClause = (
  category?: string,
  filter?: string,
): Prisma.PostWhereInput => {
  const where: Prisma.PostWhereInput = {
    status: PostStatus.PUBLISHED,
  };

  if (category) {
    where.categories = {
      some: { name: { equals: category, mode: "insensitive" } },
    };
  }

  if (filter) {
    where.OR = [
      { title: { contains: filter, mode: "insensitive" } },
      {
        content: { contains: filter, mode: "insensitive" },
      },
    ];
  }

  return where;
};

export const checkPostAuthorization = (
  post: { authorId: string },
  authorId: string,
  userRole: string,
  action: string,
) => {
  // Allow if user is admin or post owner
  if (userRole === Role.ADMIN || post.authorId === authorId) {
    return;
  }
  throw new ForbiddenError(`You are not allowed to ${action} this post`);
};
