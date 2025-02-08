import { Router } from "express";

import { Authenticate } from "@/middleware/authenticate.middleware";
import { validate } from "@/middleware/validateRequest.middleware";
import {
  getCurrentUserHandler,
  loginHandler,
  logoutHandler,
  refreshTokensHandler,
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

router.get("/me", Authenticate, getCurrentUserHandler);

router.post("/refresh", refreshTokensHandler);

router.post("/logout", Authenticate, logoutHandler);

export default router;
