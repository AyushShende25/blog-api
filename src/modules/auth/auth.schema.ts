import { object, string, type z } from "zod";

export const signupSchema = object({
	body: object({
		username: string({
			required_error: "username is required",
		}).trim(),
		email: string({
			required_error: "Email address is required",
		})
			.email("Invalid email address")
			.trim(),
		password: string({
			required_error: "Password is required",
		})
			.min(8, "Password must be more than 8 characters")
			.max(32, "Password must be less than 32 characters")
			.trim(),
	}),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
