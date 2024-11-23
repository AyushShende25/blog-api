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

const app: Application = express();

app
	.use(cors())
	.use(morganMiddleware)
	.use(cookieParser())
	.use(express.json())
	.get("/health", (_req: Request, res: Response) => {
		res.json({
			ok: true,
		});
	});
app.use("/api/auth", authRouter);

app
	.all("*splat", () => {
		throw new NotFoundError();
	})
	.use(errorHandler);

export default app;
