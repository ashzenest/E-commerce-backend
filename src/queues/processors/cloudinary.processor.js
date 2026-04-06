import { Worker } from "bullmq";
import { getRedisClient } from "../../config/valkey.config.js"
import { logger } from "../../config/logger.config.js";
import { jobDurations, jobRetriesTotal, jobsTotal, queueDepth } from "../../config/metric/worker.metrics.js";
import { trackDuration } from "../../utils/trackDuration.js";
import {cloudinaryActions} from "../../utils/cloudinaryActions.js"
import { getCloudinaryQueue } from "../index.js"

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

        const action = cloudinaryActions[job.name]
        if(!action){
            log.error({jobName: job.name}, "Ghost job detected")
            return
        }
        await trackDuration(jobDurations, {queue: "cloudinary"}, async () => {
            await action(job.data)
            log.info("Cloudinary delete completed")
        })
        
    }, {
        connection: getRedisClient(),
        concurrency: 5
    })

    cloudinaryWorker.on("completed", () => {
        jobsTotal.inc({
            queue: "cloudinary",
            status: "success"
        })
    })

    cloudinaryWorker.on("failed", (job, err) => {
        const maxAttempts = job.opts.attempts ?? 1
        const isFinal = job.attemptsMade >= maxAttempts
        const logContext = {
            err,
            phase: "worker",
            queue: "cloudinary",
            jobId: job.id,
            attempts: job.attemptsMade,
            reqId: job.data.reqId
        }
        if (isFinal){
            logger.error(logContext, "Cloudinary job failed after all retries")
            jobsTotal.inc({
                queue: "cloudinary",
                status: "failed"
            })
        } else {
            logger.warn(logContext, "Cloudinary job failed, moving to retry...")
            jobRetriesTotal.inc({queue: "cloudinary"})
        }
    })

    cloudinaryWorker.on("error", (err) => {
        logger.catastrophe({err}, "Cloudinary Worker experienced a critical error")
    })

    const updateCloudinaryQueueDepth = async() => {
        const counts = await getCloudinaryQueue().getJobCounts("waiting", "active", "delayed")
        queueDepth.set({queue: "cloudinary"}, counts.waiting + counts.active + counts.delayed)
    }
    setInterval(updateCloudinaryQueueDepth, 1000)
}

export {createCloudinaryWorker}