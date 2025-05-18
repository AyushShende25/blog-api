import { Router } from "express";

import { Authenticate } from "@/middleware/authenticate.middleware";
import { getCurrentUserHandler } from "@/modules/users/users.controller";

const router: Router = Router();

router.get("/me", Authenticate, getCurrentUserHandler);

export default router;
