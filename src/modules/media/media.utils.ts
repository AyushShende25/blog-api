import { randomUUID } from "node:crypto";

export const sanitizeFilename = (filename: string) => {
	return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
};

export const generateFileKey = ({
	filename,
	usage,
}: {
	filename: string;
	usage: "POST" | "AVATAR";
}) => {
	const sanitized = sanitizeFilename(filename);
	const uniqueFilename = `${randomUUID()}-${sanitized}`;

	const prefix = usage === "AVATAR" ? "avatars" : "posts";

	return `${prefix}/${uniqueFilename}`;
};
