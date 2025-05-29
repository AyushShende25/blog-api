import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const env = process.env.NODE_ENV || "development";
const isDevelopment = env === "development";

const level = () => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }

  return isDevelopment ? "debug" : "info";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Different formats for different environments
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const transports = [
  new winston.transports.Console({
    format: isDevelopment ? developmentFormat : productionFormat,
  }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: productionFormat,
  }),
  new winston.transports.File({
    filename: "logs/all.log",
    format: productionFormat,
  }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format: isDevelopment ? developmentFormat : productionFormat,
  transports,
});

export default Logger;
