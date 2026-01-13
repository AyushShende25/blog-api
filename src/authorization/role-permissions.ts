import type { Role } from "generated/prisma/enums";
import { type Permission, Permissions } from "./permissions";

export const RolePermissions: Record<Role, Permission[]> = {
	USER: [
		Permissions.USER_READ_SELF,
		Permissions.USER_UPDATE_SELF,

		Permissions.POST_CREATE,
		Permissions.POST_UPDATE_OWN,
		Permissions.POST_DELETE_OWN,
	],
	ADMIN: [
		Permissions.USER_READ_SELF,
		Permissions.USER_UPDATE_SELF,

		Permissions.ADMIN_PANEL_ACCESS,

		Permissions.POST_CREATE,
		Permissions.POST_UPDATE_OWN,
		Permissions.POST_DELETE_OWN,

		Permissions.POST_MANAGE_ANY,
	],
};
