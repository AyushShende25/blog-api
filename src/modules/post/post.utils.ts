import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Request, Response } from "express";

import { env } from "@/config/env";
import { s3 } from "@/config/s3";
import type { GeneratePresignedUrlInput } from "@modules/post/post.schema";

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
