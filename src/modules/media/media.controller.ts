import type { Request, Response } from "express";
import {
	createMediaSchema,
	mediaIdSchema,
	presignedUrlSchema,
} from "./media.schema";
import {
	createMedia,
	createPresignedUploadUrl,
	deleteMedia,
} from "./media.service";

export const generatePresignedUrlController = async (
	req: Request,
	res: Response,
) => {
	const { filename, mimeType, usage } = presignedUrlSchema.parse(req.body);

	const result = await createPresignedUploadUrl({
		filename,
		mimeType,
		usage,
	});

	res.status(200).json({ result });
};

export const createMediaController = async (req: Request, res: Response) => {
	const input = createMediaSchema.parse(req.body);

	const media = await createMedia({ userId: req.user!.id, input });

	res.status(201).json({ media });
};

export const deleteMediaController = async (req: Request, res: Response) => {
	const { id } = mediaIdSchema.parse(req.params);

	await deleteMedia({ userId: req.user!.id, mediaId: id });

	res.status(204).send();
};
