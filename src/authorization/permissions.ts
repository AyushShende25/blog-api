export const Permissions = {
	USER_READ_SELF: "user:read:self",
	USER_UPDATE_SELF: "user:update:self",
	USER_DELETE_SELF: "user:delete:self",

	USER_READ_ANY: "user:read:any",
	USER_MANAGE_ANY: "user:manage:any",

	POST_CREATE: "post:create",
	POST_UPDATE_OWN: "post:update:own",
	POST_DELETE_OWN: "post:delete:own",

	POST_READ_ANY: "post:read:any",
	POST_MANAGE_ANY: "post:manage:any",

	CATEGORY_CREATE: "category:create",
	CATEGORY_UPDATE: "category:update",
	CATEGORY_DELETE: "category:delete",

	TAG_CREATE: "tag:create",
	TAG_UPDATE: "tag:update",
	TAG_DELETE: "tag:delete",

	COMMENT_CREATE: "comment:create",
	COMMENT_UPDATE_OWN: "comment:update:own",
	COMMENT_DELETE_OWN: "comment:delete:own",

	COMMENT_MANAGE_ANY: "comment:manage:any",

	LIKE_CREATE: "like:create",
	LIKE_DELETE_OWN: "like:delete:own",
	LIKE_MANAGE_ANY: "like:manage:any",

	ADMIN_PANEL_ACCESS: "admin:access",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
