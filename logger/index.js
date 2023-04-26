const { format, createLogger, transports } = require("winston");
require("winston-daily-rotate-file");

const { timestamp, combine, printf, errors, splat } = format;

const transport = new transports.DailyRotateFile({
  filename: "app-%DATE%.log",
  dirname: "./logger/logs",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
});

const logger = createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    errors({ stack: true }),
    splat(),
    printf((info) => {
      const { timestamp, level, message, ...rest } = info;

      return `${timestamp} [${level.toUpperCase()}]: ${message} ${
        Object.keys(rest).length > 0 ? JSON.stringify(rest) : ""
      }`;
    })
  ),
  transports: [transport],
});

module.exports = logger;
