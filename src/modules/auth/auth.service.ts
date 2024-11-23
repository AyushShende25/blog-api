import prisma from "@/config/db";
import { env } from "@/config/env";
import { BadRequestError, ServiceUnavailableError } from "@/errors";
import { setVerificationCode } from "@/redis/verificationCode.redis";
import { generateVerificationCode, hashPassword } from "@/utils";
import Email from "@/utils/emailService";
import Logger from "@/utils/logger";
import type { SignupInput } from "@modules/auth/auth.schema";

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
		await new Email(newUser, emailVerificationCode).sendVerificationCode();

		await setVerificationCode(newUser.id, emailVerificationCode);
	} catch (error) {
		Logger.error("could not send email");
		throw new ServiceUnavailableError("Email service is down");
	}

	const { password, ...safeUser } = newUser;
	return safeUser;
};

const findUserbyEmail = async (email: string) => {
	return prisma.user.findUnique({
		where: { email },
	});
};

const findUserbyId = async (id: string) => {
	return prisma.user.findUnique({
		where: { id },
	});
};
