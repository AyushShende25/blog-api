import { Router } from "express";

import { validate } from "@/middleware/validateRequest.middleware";
import { signupHandler } from "@modules/auth/auth.controller";
import { signupSchema } from "@modules/auth/auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);

export default router;
