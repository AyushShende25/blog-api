export type EmailJobType =
	| "verification"
	| "password-reset"
	| "welcome"
	| "reset-success";

export type BaseEmailJobData = {
	email: string;
	username: string;
};

export interface VerificationEmailData extends BaseEmailJobData {
	type: "verification";
	link: string;
}

export interface PasswordResetEmailData extends BaseEmailJobData {
	type: "password-reset";
	resetLink: string;
}

export interface WelcomeEmailData extends BaseEmailJobData {
	type: "welcome";
}
export interface ResetSuccessEmailData extends BaseEmailJobData {
	type: "reset-success";
}

export type EmailJobData =
	| VerificationEmailData
	| PasswordResetEmailData
	| ResetSuccessEmailData
	| WelcomeEmailData;
