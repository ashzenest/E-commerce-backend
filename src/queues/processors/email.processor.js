import { Worker } from "bullmq";
import { sendChangeEmailRequest, sendForgetPasswordEmail, sendRegistrationEmail } from "../../services/email.service.js";
import { getRedisClient } from "../../config/valkey.config.js";

let emailWorker = null

const createEmailWorker = () => {
    emailWorker = new Worker("emailQueue", async(job) => {
        if(job.name === "sendChangeEmailRequest"){
            const {email, fullname, magicLink} = job.data
            await sendChangeEmailRequest(email, fullname, magicLink)
        }
        if(job.name === "sendForgetPasswordEmail"){
            const {email, fullname, magicLink} = job.data
            await sendForgetPasswordEmail(email, fullname, magicLink)
        }
        if(job.name === "sendRegistrationEmail"){
            const {email, fullname} = job.data
            await sendRegistrationEmail(email, fullname)
        }

    }, {connection: getRedisClient()})
}

export {createEmailWorker}