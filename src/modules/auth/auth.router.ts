import {
	forgotPasswordHandler,
	loginHandler,
	logoutAllHandler,
	logoutHandler,
	refreshTokensHandler,
	resetPasswordHandler,
	signupHandler,
	verifyEmailHandler,
} from "@modules/auth/auth.controller";
import { Router } from "express";
import { Authenticate } from "@/middleware/authenticate.middleware";

const router = Router();

router.post("/signup", signupHandler);

router.post("/verify-email", verifyEmailHandler);

router.post("/login", loginHandler);

router.post("/refresh", refreshTokensHandler);

router.post("/forgot-password", forgotPasswordHandler);

router.post("/reset-password", resetPasswordHandler);

router.post("/logout", logoutHandler);

router.post("/logout-all", Authenticate, logoutAllHandler);

export default router;
