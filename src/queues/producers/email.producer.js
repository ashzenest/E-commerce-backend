import { queueDepth } from "../../config/metrics.config.js"
import { getEmailQueue } from "../index.js"

const jobOptions = {
    attempts: 5,
    backoff: {
        type: "exponential",
        delay: 1000
    }, 
    removeOnComplete: true,
    removeOnFail: {
        age: 60*60*24
    }
}

const addChangeEmailRequestToQueue = async(email, fullname, magicLink, reqId) => {
    await getEmailQueue().add("sendChangeEmailRequest", {
        email,
        fullname,
        magicLink,
        reqId
    }, jobOptions)
    queueDepth.inc({queue: "email"})
}

const addForgetPasswordEmailToQueue = async(email, fullname, magicLink, reqId) => {
    await getEmailQueue().add("sendForgetPasswordEmail", {
        email,
        fullname,
        magicLink,
        reqId
    }, jobOptions)
    queueDepth.inc({queue: "email"})
}

const addSendRegistrationEmailToQueue = async(email, fullname, reqId) => {
    await getEmailQueue().add("sendRegistrationEmail", {
        email,
        fullname,
        reqId
    }, jobOptions)
    queueDepth.inc({queue: "email"})
}

export {
    addChangeEmailRequestToQueue,
    addForgetPasswordEmailToQueue,
    addSendRegistrationEmailToQueue
}