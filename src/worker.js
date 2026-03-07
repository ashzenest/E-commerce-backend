import { connectRedis } from "./config/valkey.config.js";
import { createEmailWorker } from "./queues/processors/email.processor.js";

const start = async() => {
    await connectRedis()
    createEmailWorker()
}

start().catch((error) => {
    console.error(error)
    process.exit(1)
})