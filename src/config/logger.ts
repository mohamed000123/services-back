import env from "@/config/env";
import winston from "winston";

const customLevels: {
  levels: { [key: string]: number };
  colors: { [key: string]: string };
} = {
  levels: {
    trace: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 0,
  },
  colors: {
    trace: "white",
    debug: "green",
    info: "green",
    warn: "yellow",
    error: "red",
    fatal: "red",
  },
};

const formatter: winston.Logform.Format = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.splat(),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const {
      timestamp,
      level,
      message,
      ...meta
    }: winston.Logform.TransformableInfo = info;

    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
      }`;
  })
);

class Logger {
  private logger: winston.Logger;

  constructor() {
    const prodTransport: winston.transports.FileTransportInstance =
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      });
    const transport: winston.transports.ConsoleTransportInstance =
      new winston.transports.Console({
        format: formatter,
      });
    const isProduction: boolean = env("NODE_ENV") === "production";
    this.logger = winston.createLogger({
      level: isProduction ? "error" : "trace",
      levels: customLevels.levels,
      transports: [isProduction ? prodTransport : transport],
    });
    winston.addColors(customLevels.colors);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace(msg: any, meta?: any): void {
    this.logger.log("trace", msg, meta);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(msg: any, meta?: any): void {
    this.logger.debug(msg, meta);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(msg: any, meta?: any): void {
    this.logger.info(msg, meta);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(msg: any, meta?: any): void {
    this.logger.warn(msg, meta);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(msg: any, meta?: any): void {
    this.logger.error(msg, meta);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fatal(msg: any, meta?: any): void {
    this.logger.log("fatal", msg, meta);
  }
}

export default new Logger();
