import type { Role } from "@prisma/client";

export interface ActiveUserData {
  sub: string;
  email: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string;
  refreshTokenId: string;
}

export type EmailJobType = "verification" | "welcome";

export interface EmailJobData {
  email: string;
  username: string;
  emailVerificationCode?: string;
}
