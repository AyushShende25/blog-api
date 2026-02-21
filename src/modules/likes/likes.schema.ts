import * as z from "zod";

export const postIdSchema = z.object({
	id: z.uuid(),
});
