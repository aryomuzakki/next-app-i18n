import pino, { multistream } from "pino";
import { createStream } from "rotating-file-stream";

const isProd = process.env.NODE_ENV === "production";
const LOG_LEVEL = process.env.LOG_LEVEL;
const isVercel = process.env.DEPLOY_PLATFORM === "vercel";

if (!LOG_LEVEL) {
  throw new Error("Missing Pino log level");
}

const infoStream = createStream("app.log", {
  interval: "1d", // Rotate daily
  maxSize: "10M", // Max file size 10MB
  path: "./logs", // Directory for logs
  compress: "gzip" // Compress rotated logs
});

const streams = [
  { level: "debug", stream: infoStream } // minimum level to go to app.log
];

const logger = pino(
  {
    level: LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(isProd
      ? {}
      : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss Z",
            ignore: "pid,hostname"
          }
        }
      })
  },
  isProd && !isVercel ? multistream(streams, { dedupe: true }) : undefined
);

export default logger;

/*

default level:

trace (10): Highly detailed messages, often used for following program execution flow.
debug (20): Diagnostic information useful for debugging.
info (30): General informational messages about the application’s operation.
warn (40): Indicates potential issues or unusual situations that are not critical errors.
error (50): For error conditions that prevent normal operation or signify a failure.
fatal (60): Critical errors where the application or a significant component becomes unusable.

*/ 
