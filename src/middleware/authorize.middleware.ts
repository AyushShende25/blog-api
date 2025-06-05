import { UnAuthorizedError } from "@/errors";
import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      throw new UnAuthorizedError("Role not found");
    }
    if (!allowedRoles.includes(req.role)) {
      throw new UnAuthorizedError("You do not have permission");
    }
    next();
  };
