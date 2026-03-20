import "dotenv/config";
import { connectRedis } from "./config/valkey.config.js";
import { createCloudinaryWorker } from "./queues/processors/cloudinary.processor.js";
import { createEmailWorker } from "./queues/processors/email.processor.js";
import { logger } from "./config/logger.config.js";

const start = async() => {
    logger.info("Worker process starting")
    await connectRedis()
    createEmailWorker()
    logger.info("Email worker started")
    createCloudinaryWorker()
    logger.info("Cloudinary worker started")
}

start().catch((err) => {
    logger.catastrophe({err}, "Worker failed to start")
    process.exit(1)
})