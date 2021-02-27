import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, metadata } = format;
const logFormat = printf(
  ({ timestamp, level, label, message }) => `${timestamp} ${level} [${label ?? "-"}]: ${message}`
);

export const logger = createLogger({
  exitOnError: false,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(format.colorize(), logFormat),
      level: "debug",
    }),
    new transports.File({ filename: "logs/warn.log", level: "warn" }),
  ],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "logs/rejections.log" })],
});
