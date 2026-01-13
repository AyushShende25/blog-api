export const Permissions = {
	USER_READ_SELF: "user:read:self",
	USER_UPDATE_SELF: "user:update:self",

	POST_CREATE: "post:create",
	POST_UPDATE_OWN: "post:update:own",
	POST_DELETE_OWN: "post:delete:own",

	POST_MANAGE_ANY: "post:manage:any",

	ADMIN_PANEL_ACCESS: "admin:access",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
