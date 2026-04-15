import "dotenv/config";
import "./config/email.config.js";
import "./config/cloudinary.config.js";
import http from "http"
import { connectDatabase } from "./config/database.config.js";
import { app } from "./app.js";
import { connectValkey } from "./config/valkey.config.js";
import { initializeSocket } from "./socket/index.js";
import { logger } from "./config/logger.config.js";
import { startApiMetricApp } from "./apiMetricApp.js";
import { shutdownHandler } from "./utils/apiShutdown.js";

let shutdown = undefined
const server = http.createServer(app)

const resources = {
    server,
    databaseInstance: undefined,
    valkeyInstance: undefined,
    io: undefined,
    apiMetricAppInstance: undefined,
    logger
}

const start = async() => {
    shutdown = shutdownHandler(resources)
    process.on("SIGTERM", shutdown)
    process.on("SIGQUIT", shutdown)
    process.on("SIGINT", shutdown)

    logger.info("Server is starting")

    resources.databaseInstance = await connectDatabase()
    resources.valkeyInstance = await connectValkey()
    resources.io = initializeSocket(server)
    resources.apiMetricAppInstance = startApiMetricApp()

    server.listen(process.env.PORT || 5000, () => {
        logger.info({ port: process.env.PORT || 5000 }, "Server started")
    })
}

start().catch(async (err) => {
    logger.catastrophe({err}, "Server failed to start")
    if(shutdown){
        await shutdown("STARTUP_FAILURE")
    } else {
        process.exit(1)
    }
})