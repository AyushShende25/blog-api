import type { AccessTokenPayload } from "@modules/auth/auth.types";
import type { NextFunction, Request, Response } from "express";
import type { Role } from "generated/prisma/enums";
import jwt from "jsonwebtoken";
import type { Permission } from "@/authorization/permissions";
import { env } from "@/config/env";
import { UnAuthorizedError } from "@/errors";

declare global {
	namespace Express {
		interface User {
			id: string;
			role: Role;
			permissions: Permission[];
		}

		interface Request {
			user?: User;
		}
	}
}

export const Authenticate = async (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	const accessToken =
		req.cookies?.access_token || req.headers.authorization?.split(" ")[1];

	if (!accessToken) {
		throw new UnAuthorizedError("Authentication required");
	}

	try {
		const payload = jwt.verify(
			accessToken,
			env.JWT_ACCESS_SECRET,
		) as AccessTokenPayload;

		req.user = {
			id: payload.sub,
			role: payload.role,
			permissions: payload.permissions,
		};

		next();
	} catch {
		throw new UnAuthorizedError("Invalid or expired access token");
	}
};
