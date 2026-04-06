import { Worker } from "bullmq";
import { getRedisClient } from "../../config/valkey.config.js";
import { logger } from "../../config/logger.config.js"
import { jobDurations, jobRetriesTotal, jobsTotal, queueDepth } from "../../config/metric/worker.metrics.js";
import { trackDuration } from "../../utils/trackDuration.js";
import {emailActions} from "../../utils/emailActions.js"
import { getEmailQueue } from "../index.js"

let emailWorker = null

const createEmailWorker = () => {
    emailWorker = new Worker("emailQueue", async(job) => {
        const log = logger.child({
            phase: "worker",
            queue: "email",
            jobId: job.id,
            attempt: job.attemptsMade + 1,
            reqId: job.data.reqId
        })
        log.info("Sending email started")
        
        const action = emailActions[job.name]
        if(!action){
            log.error({jobName: job.name}, "Ghost Job detected")
            return
        }
        await trackDuration(jobDurations, {queue: "email"}, async () => {
            await action(job.data)
            log.info("Email sent successfully")
        })

    }, {
        connection: getRedisClient(),
        concurrency: 5
    })

    emailWorker.on("completed", () => {
        jobsTotal.inc({
            queue: "email",
            status: "success"
        })
    })

    emailWorker.on("failed", (job, err) => {
        const maxAttempts = job.opts.attempts ?? 1
        const isFinal = job.attemptsMade >= maxAttempts
        const logContext = {
            err,
            phase: "worker",
            queue: "email",
            jobId: job.id,
            attempts: job.attemptsMade,
            reqId: job.data.reqId
        }
        if(isFinal){
            logger.error(logContext, "Email job failed after all retries")
            jobsTotal.inc({
                queue: "email",
                status: "failed"
            })
        } else {
            logger.warn(logContext, "Email job failed, moving to retry...")
            jobRetriesTotal.inc({queue: "email"})
        }
    })
    emailWorker.on("error", (err) => {
        logger.catastrophe({err}, "Email Worker experienced a critical error")
    })

    const updateEmailQueueDepth = async () => {
        const counts = await getEmailQueue().getJobCounts("waiting", "active", "delayed")
        queueDepth.set({queue: "email"}, counts.waiting + counts.active + counts.delayed)
    }

    setInterval(updateEmailQueueDepth, 1000)
}

export {createEmailWorker}