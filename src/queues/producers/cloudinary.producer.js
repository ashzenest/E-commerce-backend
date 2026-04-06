import { getCloudinaryQueue } from "../index.js"

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

const addDeleteFromCloudinary = async (filePublicId, reqId) => {
    await getCloudinaryQueue().add("deleteFromCloudinary", {
        filePublicId,
        reqId
    }, jobOptions)
}

export {addDeleteFromCloudinary}