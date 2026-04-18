import cron from "node-cron";
import { flushLowStockBuffer, sendLowStockEmailJob } from "./email.scheduler.js";
import { logger } from "../../config/logger.config.js";

const initializeCronJobs = () => {
    logger.info("Cron jobs are being initialized")
    cron.schedule("0 0 * * *", sendLowStockEmailJob)
    cron.schedule("30 0-2 * * *", flushLowStockBuffer)
    logger.info("Cron jobs initialized")
}

export {initializeCronJobs}