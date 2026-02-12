import app from "@/app";
import { env } from "@/config/env";
import Logger from "@/libs/logger";
import { initRedis } from "@/libs/redis";

const bootstrap = async () => {
	await initRedis();
	const server = app.listen(env.PORT, () => {
		Logger.info(`API running on port ${env.PORT}`);
	});

	function shutdown(code: number) {
		Logger.info("Shutting down server...");

		server.close(() => {
			Logger.info("HTTP server closed.");
			process.exit(code);
		});

		setTimeout(() => {
			Logger.error("Force shutdown");
			process.exit(code);
		}, 5000).unref();
	}

	process.on("uncaughtException", (err) => {
		Logger.error("UNCAUGHT EXCEPTION!", err);
		shutdown(1);
	});
	process.on("unhandledRejection", (reason) => {
		Logger.error("UNHANDLED PROMISE REJECTION!", reason);
		shutdown(1);
	});
	process.on("SIGINT", () => shutdown(0));
	process.on("SIGTERM", () => shutdown(0));
};

bootstrap().catch((err) => {
	console.error("Failed to bootstrap server", err);
	process.exit(1);
});
