import * as z from "zod";

export const signupSchema = z.object({
	username: z.string().trim().toLowerCase(),
	email: z.email().trim().toLowerCase(),
	password: z.string().trim().min(8).max(72),
});

export const verifyEmailSchema = z.object({ token: z.uuid() });

export const loginSchema = z.object({
	email: z.email().trim().toLowerCase(),
	password: z.string().trim(),
});

export const forgotPasswordSchema = z.object({
	email: z.email().trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
	token: z.uuid(),
	password: z.string().trim().min(8).max(72),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
