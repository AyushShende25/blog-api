import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Response,
  type Request,
} from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

import { env } from "@/config/env";
import { NotFoundError } from "@/errors";
import { errorHandler } from "@/middleware/errorHandler.middleware";
import morganMiddleware from "@/middleware/morgan.middleware";
import authRouter from "@modules/auth/auth.router";
import categoryRouter from "@modules/categories/category.router";
import postRouter from "@modules/post/post.router";
import userRouter from "@modules/users/users.router";
import "@/jobs";

const app: Application = express();

app
  .use(cors({ origin: env.CLIENT_URL, credentials: true }))
  .use(helmet())
  .use(morganMiddleware)
  .use(cookieParser())
  .use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
    }),
  )
  .use(
    express.json({
      limit: "100kb",
    }),
  )
  .use(hpp())
  .get("/api/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
    });
  });
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/categories", categoryRouter);

app
  .all("*splat", () => {
    throw new NotFoundError();
  })
  .use(errorHandler);

export default app;
