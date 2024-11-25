import { Router } from "express";

import { validate } from "@/middleware/validateRequest.middleware";
import {
	signupHandler,
	verifyEmailHandler,
} from "@modules/auth/auth.controller";
import { signupSchema, verifyEmailSchema } from "@modules/auth/auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);

router.post("/verify-email", validate(verifyEmailSchema), verifyEmailHandler);

export default router;
