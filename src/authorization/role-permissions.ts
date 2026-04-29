import type { Role } from "generated/prisma/enums";
import { type Permission, Permissions } from "./permissions";

export const RolePermissions: Record<Role, Permission[]> = {
	USER: [
		Permissions.USER_READ_SELF,
		Permissions.USER_UPDATE_SELF,
		Permissions.USER_DELETE_SELF,

		Permissions.POST_CREATE,
		Permissions.POST_UPDATE_OWN,
		Permissions.POST_DELETE_OWN,

		Permissions.COMMENT_CREATE,
		Permissions.COMMENT_UPDATE_OWN,
		Permissions.COMMENT_DELETE_OWN,

		Permissions.TAG_CREATE,
	],
	ADMIN: [
		Permissions.USER_READ_SELF,
		Permissions.USER_UPDATE_SELF,
		Permissions.USER_DELETE_SELF,
		Permissions.USER_READ_ANY,
		Permissions.USER_MANAGE_ANY,

		Permissions.ADMIN_PANEL_ACCESS,

		Permissions.POST_CREATE,
		Permissions.POST_UPDATE_OWN,
		Permissions.POST_DELETE_OWN,

		Permissions.POST_READ_ANY,
		Permissions.POST_MANAGE_ANY,

		Permissions.COMMENT_CREATE,
		Permissions.COMMENT_UPDATE_OWN,
		Permissions.COMMENT_DELETE_OWN,

		Permissions.COMMENT_MANAGE_ANY,

		Permissions.CATEGORY_CREATE,
		Permissions.CATEGORY_UPDATE,
		Permissions.CATEGORY_DELETE,

		Permissions.TAG_CREATE,
		Permissions.TAG_UPDATE,
		Permissions.TAG_DELETE,
	],
};
