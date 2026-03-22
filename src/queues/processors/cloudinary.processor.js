import { Worker } from "bullmq";
import { getRedisClient } from "../../config/valkey.config.js"
import { deleteFromCloudinary } from "../../services/cloudinary.service.js"
import { logger } from "../../config/logger.config.js";

let cloudinaryWorker = null

const createCloudinaryWorker = () => {
    cloudinaryWorker = new Worker("cloudinaryQueue", async(job) => {
        const log = logger.child({
            phase: "worker",
            queue: "cloudinary",
            jobId: job.id,
            attempt: job.attemptsMade + 1,
            reqId: job.data.reqId
        })
        log.info("Deleting image from cloudinary started")

        if(job.name === "deleteFromCloudinary"){
            const {filePublicId} = job.data
            const success = await deleteFromCloudinary(filePublicId)
            if(!success){
                log.warn({ filePublicId }, "Cloudinary deletion failed")
                return
            }
            log.info({ filePublicId }, "Image deleted from cloudinary successfully")
        }
    }, {connection: getRedisClient()})

    cloudinaryWorker.on("failed", (job, err) => {
        logger.error({
            err,
            phase: "worker",
            queue: "cloudinary",
            jobId: job.id,
            attempts: job.attemptsMade,
            reqId: job.data.reqId
        }, "Cloudinary job failed after all retries")
    })
}

export {createCloudinaryWorker}