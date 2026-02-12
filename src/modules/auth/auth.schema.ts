import * as z from "zod";

const emailSchema = z.object({
	email: z.email().trim().toLowerCase(),
});

const passwordSchema = z.object({
	password: z.string().trim().min(8).max(72),
});

export const signupSchema = z.object({
	...emailSchema.shape,
	...passwordSchema.shape,
	username: z.string().trim().toLowerCase(),
});

export const loginSchema = emailSchema.extend({
	password: z.string().trim(),
});

export const forgotPasswordSchema = emailSchema;

export const tokenParamsSchema = z.object({
	token: z.uuid(),
});

export const resetPasswordSchema = passwordSchema;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
