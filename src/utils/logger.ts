import winston from "winston";
import "winston-daily-rotate-file";
import { mkdirSync } from "node:fs";

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

mkdirSync("logs", { recursive: true });

const level = () => {
	if (process.env.LOG_LEVEL) {
		return process.env.LOG_LEVEL;
	}
	const env = process.env.NODE_ENV || "development";
	return env === "development" ? "debug" : "warn";
};

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
	winston.format.colorize({ all: true }),
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.align(),
	winston.format.printf(
		({ timestamp, level, message, service }) =>
			`${timestamp} [${service}] ${level}: ${message}`,
	),
);

const fileFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.align(),
	winston.format.printf(
		({ timestamp, level, message, service }) =>
			`${timestamp} [${service}] ${level}: ${message}`,
	),
);

const transports = [
	new winston.transports.Console({ format: consoleFormat }),
	new winston.transports.DailyRotateFile({
		filename: "logs/error-%DATE%.log",
		datePattern: "YYYY-MM-DD",
		level: "error",
		maxFiles: "14d",
		format: fileFormat,
	}),

	new winston.transports.DailyRotateFile({
		filename: "logs/combined-%DATE%.log",
		datePattern: "YYYY-MM-DD",
		maxFiles: "14d",
		format: fileFormat,
	}),
];

const Logger = winston.createLogger({
	level: level(),
	levels,
	transports,
});

export default Logger;
