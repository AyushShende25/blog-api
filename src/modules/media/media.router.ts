import { Router } from "express";
import { Authenticate } from "@/middleware/authenticate.middleware";
import {
	createMediaController,
	deleteMediaController,
	generatePresignedUrlController,
} from "./media.controller";

const router = Router();

router.post(
	"/generate-presigned-url",
	Authenticate,
	generatePresignedUrlController,
);

router.post("/", Authenticate, createMediaController);

router.delete("/:id", Authenticate, deleteMediaController);

export default router;
