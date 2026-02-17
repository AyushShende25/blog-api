import type { Prisma, UserStatus } from "generated/prisma/client";

export const buildOrderBy = (
	sort: string,
): Prisma.UserOrderByWithRelationInput[] => {
	const [field, order] = sort.split(":");

	const allowedFields = ["createdAt", "username", "email", "deletedAt"];

	if (!allowedFields.includes(field)) {
		return [{ createdAt: "desc" }];
	}
	const orderDirection = order === "asc" ? "asc" : "desc";

	return [{ [field]: orderDirection }, { createdAt: "desc" }];
};

type whereParams = {
	search?: string;
	includeDeleted?: boolean;
	status?: UserStatus;
};
export const buildWhereClause = ({
	includeDeleted,
	search,
	status,
}: whereParams) => {
	const where: Prisma.UserWhereInput = {};

	if (!includeDeleted) {
		where.deletedAt = null;
	}

	if (status) {
		where.status = { equals: status };
	}

	if (search) {
		where.OR = [
			{ username: { contains: search, mode: "insensitive" } },
			{ email: { contains: search, mode: "insensitive" } },
		];
	}

	return where;
};
