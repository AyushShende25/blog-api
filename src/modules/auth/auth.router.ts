import { Router } from "express";

import { validate } from "@/middleware/validateRequest.middleware";
import {
  loginHandler,
  signupHandler,
  verifyEmailHandler,
} from "@modules/auth/auth.controller";
import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
} from "@modules/auth/auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);

router.post("/verify-email", validate(verifyEmailSchema), verifyEmailHandler);

router.post("/login", validate(loginSchema), loginHandler);

export default router;
