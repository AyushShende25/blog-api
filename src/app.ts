import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Response,
	type Request,
} from "express";

import morganMiddleware from "@/middleware/morgan.middleware";

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

export default app;
