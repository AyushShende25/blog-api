export type EmailJobType = "verification" | "welcome";

export type EmailJobData = {
  email: string;
  username: string;
  emailVerificationCode?: string;
  resetLink?: string;
};
