import type { Role } from "generated/prisma/enums";
import type { Permission } from "@/authorization/permissions";

export type AccessTokenPayload = {
	sub: string;
	role: Role;
	permissions: Permission[];
};
