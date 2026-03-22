import { getEmailQueue } from "../index.js"

const jobOptions = {
    attempts: 5,
    backoff: {
        type: "exponential",
        delay: 1000
    }
}

const addChangeEmailRequestToQueue = async(email, fullname, magicLink, reqId) => {
    getEmailQueue().add("sendChangeEmailRequest", {
        email,
        fullname,
        magicLink,
        reqId
    }, jobOptions)
}

const addForgetPasswordEmailToQueue = async(email, fullname, magicLink, reqId) => {
    getEmailQueue().add("sendForgetPasswordEmail", {
        email,
        fullname,
        magicLink,
        reqId
    }, jobOptions)
}

const addSendRegistrationEmailToQueue = async(email, fullname, reqId) => {
    getEmailQueue().add("sendRegistrationEmail", {
        email,
        fullname,
        reqId
    }, jobOptions)
}

export {
    addChangeEmailRequestToQueue,
    addForgetPasswordEmailToQueue,
    addSendRegistrationEmailToQueue
}