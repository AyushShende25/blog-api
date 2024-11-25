import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import prisma from "@/config/db";
import { env } from "@/config/env";
import {
  BadRequestError,
  ServiceUnavailableError,
  UnAuthorizedError,
} from "@/errors";
import * as refreshTokenIdStorage from "@/redis/refreshTokenIdStorage.redis";
import * as verificationCodeStorage from "@/redis/verificationCodeStorage.redis";
import {
  comparePassword,
  generateTokens,
  generateVerificationCode,
  hashPassword,
} from "@/utils";
import Email from "@/utils/emailService";
import Logger from "@/utils/logger";
import type {
  LoginInput,
  SignupInput,
  VerifyEmailInput,
} from "@modules/auth/auth.schema";
import type { RefreshTokenPayload } from "@modules/auth/auth.types";

export const signupService = async (signupInput: SignupInput) => {
  const existingUser = await findUserbyEmail(signupInput.email);
  if (existingUser) {
    throw new BadRequestError("email already in use");
  }

  const hashedPassword = await hashPassword(signupInput.password);

  const newUser = await prisma.user.create({
    data: {
      email: signupInput.email,
      username: signupInput.username,
      password: hashedPassword,
    },
  });

  try {
    const emailVerificationCode = generateVerificationCode();
    await new Email(newUser).sendVerificationCode(emailVerificationCode);

    await verificationCodeStorage.setVerificationCode(
      newUser.id,
      emailVerificationCode,
    );
  } catch (error) {
    Logger.error("could not send verification email");
    throw new ServiceUnavailableError("Email service is down");
  }

  const { password, ...safeUser } = newUser;
  return safeUser;
};

export const verifyEmailService = async (
  verifyEmailInput: VerifyEmailInput,
) => {
  const { verificationCode } = verifyEmailInput;
  const userId =
    await verificationCodeStorage.getVerificationCode(verificationCode);

  if (!userId) {
    throw new BadRequestError("Invalid or expired verification code");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isVerified: true,
    },
  });

  if (updatedUser) {
    try {
      await verificationCodeStorage.deleteVerificationCode(verificationCode);
      await new Email(updatedUser).sendWelcome();
    } catch (error) {
      Logger.error("could not send welcome email");
      throw new ServiceUnavailableError("Email service is down");
    }
  }
  return updatedUser;
};

export const loginService = async (loginInput: LoginInput) => {
  const user = await findUserbyEmail(loginInput.email);

  if (!user || !user.isVerified) {
    throw new UnAuthorizedError("Invalid Credentials or user is not verified");
  }

  const isPasswordValid = comparePassword(loginInput.password, user.password);

  if (!isPasswordValid) {
    throw new UnAuthorizedError("Invalid credentials");
  }

  const { access_token, refresh_token } = await generateTokens(user);
  const { password, ...safeUser } = user;
  return { access_token, refresh_token, user: safeUser };
};

export const refreshTokensService = async (req: Request) => {
  const refreshToken: string = req.cookies.refresh_token;
  if (!refreshToken) {
    throw new UnAuthorizedError();
  }
  try {
    const { refreshTokenId, sub } = jwt.verify(
      refreshToken,
      env.JWT_SECRET,
    ) as RefreshTokenPayload;

    const user = await findUserbyId(sub);
    if (!user) {
      throw new UnAuthorizedError("User does not exist");
    }

    const isValid = await refreshTokenIdStorage.validate(
      user.id,
      refreshTokenId,
    );
    if (isValid) {
      await refreshTokenIdStorage.invalidate(user.id);
    } else {
      throw new UnAuthorizedError("Invalid token");
    }
    return await generateTokens(user);
  } catch (error) {
    throw new UnAuthorizedError("Invalid token: Access Denied");
  }
};

export const logoutService = async (userId: string) => {
  await refreshTokenIdStorage.invalidate(userId);
};

const findUserbyEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserbyId = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};
