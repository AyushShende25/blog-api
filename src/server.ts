import "dotenv/config";

import app from "@/app";
import { env } from "@/config/env";
import Logger from "@/utils/logger";

app.listen(env.PORT, () => {
	Logger.info(`api running on ${env.PORT}`);
});
