const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, metadata, json } = format;
const path = require("path");

const logFormat = printf((info) => `${info.timestamp} ${info.level} [${info.label}]: ${JSON.stringify(info.message)}`);

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  exitOnError: false,
  format: combine(
    label({ label: path.basename(require.main.filename) }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    metadata({ fillExcept: ["message", "level", "timestamp", "label"] })
  ),
  transports: [
    new transports.Console({
      format: combine(format.colorize(), logFormat),
      level: "debug",
    }),
    new transports.File({ filename: "logs/info.log", level: "info", format: logFormat }),
  ],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log", format: logFormat })],
  rejectionHandlers: [new transports.File({ filename: "logs/rejections.log", format: logFormat })],
});
