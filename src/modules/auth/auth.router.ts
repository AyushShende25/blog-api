import {
	forgotPasswordController,
	loginController,
	logoutAllController,
	logoutController,
	refreshTokensController,
	resetPasswordController,
	signupController,
	verifyEmailController,
} from "@modules/auth/auth.controller";
import { Router } from "express";
import { Authenticate } from "@/middleware/authenticate.middleware";

const router = Router();

router.post("/signup", signupController);

router.post("/verify-email", verifyEmailController);

router.post("/login", loginController);

router.post("/refresh", refreshTokensController);

router.post("/forgot-password", forgotPasswordController);

router.post("/reset-password", resetPasswordController);

router.post("/logout", logoutController);

router.post("/logout-all", Authenticate, logoutAllController);

export default router;
