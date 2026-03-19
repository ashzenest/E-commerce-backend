import pino, { stdSerializers } from "pino";

const logger = pino({
    customLevels: {catastrophe: 70},
    level: process.env.LOG_LEVEL ?? "info",
    base: {
        service: "Api Server",
        env: process.env.NODE_ENV
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => ({level: label.toUpperCase()})
    },
    redact: {
        paths: [
            "user.password",
            "user.refreshToken",
            "socket.handshake.auth.token",
            "req.body.password",
            "req.body.newPassword",
            "req.token",
            "req.cookies",
            "req.headers.cookie",
            "req.headers.authorization"
        ],
        remove: true
    },
    serializers: {
        err: stdSerializers.err,
        req: (req) => ({
            ip: req.ip,
            url: req.url,
            method: req.method
        }),
        res: (res) => ({
            statusCode: res.statusCode
        })
    },
    transport: process.env.NODE_ENV === "development" ? {
        target:  "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard"
        }
    } : undefined,
})

export {logger}

//I used pino for structured JSON logging, and writing to stdout as setting up log aggregation depend on infra and i am keeping it flexible for future
//For aggregation, you can either write logs to stdout and have an agent like Datadog or Fluentd tail it directly, or write to a file first and have the aggregator pull from that — the file approach is useful when you need a local backup or your aggregator cannot directly access your process output.