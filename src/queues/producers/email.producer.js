import { getEmailQueue } from "../index.js"

const jobOptions = {
    attempts: 5,
    backoff: {
        type: "exponential",
        delay: 1000
    }
}

const addChangeEmailRequestToQueue = async(email, fullname, magicLink) => {
    getEmailQueue().add("sendChangeEmailRequest", {
        email,
        fullname,
        magicLink
    }, jobOptions)
}

const addForgetPasswordEmailToQueue = async(email, fullname, magicLink) => {
    getEmailQueue().add("sendForgetPasswordEmail", {
        email,
        fullname,
        magicLink
    }, jobOptions)
}

const addSendRegistrationEmailToQueue = async(email, fullname) => {
    getEmailQueue().add("sendRegistrationEmail", {
        email,
        fullname
    }, jobOptions)
}

export {
    addChangeEmailRequestToQueue,
    addForgetPasswordEmailToQueue,
    addSendRegistrationEmailToQueue
}