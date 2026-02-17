import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env";
import { ForbiddenError, NotFoundError } from "@/errors";
import { db } from "@/libs/db";
import { s3 } from "@/libs/s3";
import type { CreateMediaInput } from "./media.schema";
import { generateFileKey } from "./media.utils";

const PRESIGNED_URL_EXPIRY_SECONDS = 5 * 60;

export const createPresignedUploadUrl = async ({
	filename,
	mimeType,
	usage,
}: {
	filename: string;
	mimeType: string;
	usage: "POST" | "AVATAR";
}) => {
	const fileKey = generateFileKey({ filename, usage });

	const command = new PutObjectCommand({
		Bucket: env.BUCKET_NAME,
		Key: fileKey,
		ContentType: mimeType,
	});

	const uploadUrl = await getSignedUrl(s3, command, {
		expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
	});

	const fileUrl = `${env.BUCKET_CUSTOM_DOMAIN}/${fileKey}`;

	return { uploadUrl, fileUrl, fileKey };
};

export const createMedia = async ({
	userId,
	input,
}: {
	userId: string;
	input: CreateMediaInput;
}) => {
	return db.media.create({
		data: {
			url: input.url,
			mimeType: input.mimeType,
			size: input.size,
			type: input.type,
			uploaderId: userId,
		},
	});
};

export const deleteMedia = async ({
	userId,
	mediaId,
}: {
	userId: string;
	mediaId: string;
}) => {
	const media = await db.media.findUnique({
		where: { id: mediaId },
	});

	if (!media) throw new NotFoundError("Media not found");

	if (media.uploaderId !== userId) {
		throw new ForbiddenError("You cannot delete this media");
	}

	const fileKey = media.url.replace(`${env.BUCKET_CUSTOM_DOMAIN}/`, "");

	await s3.send(
		new DeleteObjectCommand({
			Bucket: env.BUCKET_NAME,
			Key: fileKey,
		}),
	);

	await db.media.delete({ where: { id: mediaId } });
};
