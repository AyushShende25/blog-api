import type { NextFunction, Request, Response } from "express";
import type { Permission } from "@/authorization/permissions";
import { ForbiddenError } from "@/errors";

export const RequirePermission =
	(permission: Permission) =>
	(req: Request, _res: Response, next: NextFunction) => {
		const user = req.user;

		if (!user?.permissions.includes(permission)) {
			throw new ForbiddenError("Insufficient permissions");
		}

		next();
	};

export const RequireAnyPermission =
	(permissions: Permission[]) =>
	(req: Request, _res: Response, next: NextFunction) => {
		const user = req.user;

		if (!permissions.some((p) => user?.permissions.includes(p))) {
			throw new ForbiddenError("Insufficient permissions");
		}

		next();
	};
