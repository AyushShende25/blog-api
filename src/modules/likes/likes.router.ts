import { Router } from "express";
import { Authenticate } from "@/middleware/authenticate.middleware";
import { addLikeController, removeLikeController } from "./likes.controller";

const router = Router();

router.post("/post/:id", Authenticate, addLikeController);

router.delete("/post/:id", Authenticate, removeLikeController);

export default router;
