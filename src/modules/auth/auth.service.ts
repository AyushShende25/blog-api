import type { Request } from "express";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import {
  BadRequestError,
  ServiceUnavailableError,
  UnAuthorizedError,
} from "@/errors";
import { addEmailToQueue } from "@/jobs";
import { findUserbyEmail, findUserbyId } from "@/modules/users/users.service";
import * as refreshTokenIdStorage from "@/redis/refreshTokenIdStorage.redis";
import * as verificationCodeStorage from "@/redis/verificationCodeStorage.redis";
import Logger from "@/utils/logger";
import { createUser, verifyUser } from "@modules/auth/auth.dal";
import type {
  LoginInput,
  SignupInput,
  VerifyEmailInput,
} from "@modules/auth/auth.schema";
import type { RefreshTokenPayload } from "@modules/auth/auth.types";
import {
  comparePassword,
  generateTokens,
  generateVerificationCode,
  hashPassword,
} from "@modules/auth/auth.utils";
import { Prisma } from "@prisma/client";

export const signupService = async (signupInput: SignupInput) => {
  const existingUser = await findUserbyEmail(signupInput.email);
  if (existingUser) {
    throw new BadRequestError("email already in use");
  }
  const emailVerificationCode = generateVerificationCode();
  try {
    await addEmailToQueue("verification", {
      email: signupInput.email,
      username: signupInput.username,
      emailVerificationCode,
    });
  } catch (error) {
    Logger.error("could not send verification email");
    throw new ServiceUnavailableError("Email service is down");
  }
  const hashedPassword = await hashPassword(signupInput.password);

  try {
    const newUser = await createUser({
      email: signupInput.email,
      username: signupInput.username,
      password: hashedPassword,
    });

    await verificationCodeStorage.setVerificationCode(
      newUser.id,
      emailVerificationCode,
    );
    const { password, ...safeUser } = newUser;
    return safeUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new BadRequestError("username is already taken");
      }
    }
    throw new Error("could not register user");
  }
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

  const verifiedUser = await verifyUser(userId);

  if (verifiedUser) {
    await verificationCodeStorage.deleteVerificationCode(verificationCode);
    try {
      await addEmailToQueue("welcome", {
        email: verifiedUser.email,
        username: verifiedUser.username,
      });
    } catch (error) {
      Logger.error("could not send welcome email");
    }
  }
  return verifiedUser;
};

export const loginService = async (loginInput: LoginInput) => {
  const existingUser = await findUserbyEmail(loginInput.email);

  if (!existingUser || !existingUser.isVerified) {
    throw new UnAuthorizedError("Invalid Credentials or user is not verified");
  }

  const isPasswordValid = await comparePassword(
    loginInput.password,
    existingUser.password,
  );
  if (!isPasswordValid) {
    throw new UnAuthorizedError("Invalid credentials");
  }

  const { password, ...safeUser } = existingUser;
  const { access_token, refresh_token } = await generateTokens(safeUser);
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
