import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Response,
  type Request,
} from "express";

import { NotFoundError } from "@/errors";
import { errorHandler } from "@/middleware/errorHandler.middleware";
import morganMiddleware from "@/middleware/morgan.middleware";
import authRouter from "@modules/auth/auth.router";
import categoryRouter from "@modules/categories/category.router";
import postRouter from "@modules/post/post.router";

const app: Application = express();

app
  .use(cors({ origin: "http://localhost:3001", credentials: true }))
  .use(morganMiddleware)
  .use(cookieParser())
  .use(express.json())
  .get("/api/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
    });
  });
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/categories", categoryRouter);

app
  .all("*splat", () => {
    throw new NotFoundError();
  })
  .use(errorHandler);

export default app;
