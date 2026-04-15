import "dotenv/config";
import { connectRedis } from "./config/valkey.config.js";
import { createCloudinaryWorker } from "./queues/processors/cloudinary.processor.js";
import { createEmailWorker } from "./queues/processors/email.processor.js";
import { logger } from "./config/logger.config.js";
import { startWorkerMetricApp } from "./workerMetricApp.js";
import { workerShutdownHandler } from "./utils/workerShutdown.js";

let shutdown = undefined

const resources = {
    workerMetricAppInstance: undefined,
    redisInstance: undefined,
    emailWorkerInstance: undefined,
    cloudinaryWorkerInstance: undefined,
    logger
}

const start = async() => {
    shutdown = workerShutdownHandler(resources)
    process.on("SIGTERM", shutdown)
    process.on("SIGQUIT", shutdown)
    process.on("SIGINT", shutdown)

    logger.info("Worker process starting")

    resources.redisInstance = await connectRedis()

    resources.emailWorkerInstance = createEmailWorker()
    logger.info("Email worker started")

    resources.cloudinaryWorkerInstance = createCloudinaryWorker()
    logger.info("Cloudinary worker started")

    resources.workerMetricAppInstance = startWorkerMetricApp()
}

start().catch(async (err) => {
    logger.catastrophe({err}, "Worker failed to start")
    if(shutdown){
        await shutdown("STARTUP_FAILURE")
    } else {
        process.exit(1)
    }
})