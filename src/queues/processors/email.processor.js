import { Worker } from "bullmq";
import { sendChangeEmailRequest, sendForgetPasswordEmail, sendRegistrationEmail } from "../../services/email.service.js";
import { getRedisClient } from "../../config/valkey.config.js";
import { logger } from "../../config/logger.config.js"

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

        if(job.name === "sendChangeEmailRequest"){
            const {email, fullname, magicLink, reqId} = job.data
            const success = await sendChangeEmailRequest(email, fullname, magicLink, reqId)
            if(!success){
                log.warn("Email sending failed")
                return
            }
        }
        if(job.name === "sendForgetPasswordEmail"){
            const {email, fullname, magicLink, reqId} = job.data
            const success = await sendForgetPasswordEmail(email, fullname, magicLink, reqId)
            if(!success){
                log.warn("Email sending failed")
                return
            }
        }
        if(job.name === "sendRegistrationEmail"){
            const {email, fullname, reqId} = job.data
            const success = await sendRegistrationEmail(email, fullname, reqId)
            if(!success){
                log.warn("Email sending failed")
                return
            }
        }
        log.info("Email sent successfully")

    }, {connection: getRedisClient()})

    emailWorker.on("failed", (job, err) => {
        logger.error({
            err,
            phase: "worker",
            queue: "email",
            jobId: job.id,
            attempts: job.attemptsMade,
            reqId: job.data.reqId
        }, "Email job failed after all retries")
    })
}

export {createEmailWorker}