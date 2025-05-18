import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { getCurrentUserService } from "@/modules/users/users.service";

export const getCurrentUserHandler = async (req: Request, res: Response) => {
  const user = await getCurrentUserService(req.userId as string);
  res.status(StatusCodes.OK).json({ success: true, data: user });
};
