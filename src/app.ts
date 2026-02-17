import authRouter from "@modules/auth/auth.router";
import categoryRouter from "@modules/categories/category.router";
import mediaRouter from "@modules/media/media.router";
import postRouter from "@modules/post/post.router";
import tagRouter from "@modules/tags/tags.router";
import userRouter from "@modules/users/users.router";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { env } from "@/config/env";
import { NotFoundError } from "@/errors";
import { errorHandler } from "@/middleware/errorHandler.middleware";
import morganMiddleware from "@/middleware/morgan.middleware";

const app: Application = express();

app.use(morganMiddleware);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(hpp());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: 100,
	}),
);
app.use(cookieParser());
app.use(
	express.json({
		limit: "100kb",
	}),
);
app.get("/health", (_: Request, res: Response) => {
	res.json({
		ok: true,
	});
});
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/tags", tagRouter);
app.use("/api/media", mediaRouter);

app.all("*splat", () => {
	throw new NotFoundError();
});
app.use(errorHandler);

export default app;
