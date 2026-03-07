import { Queue } from "bullmq";
import { getRedisClient } from "../config/valkey.config.js";

let emailQueue = null

const getEmailQueue = () => {
    if(!emailQueue){
        emailQueue = new Queue("emailQueue", { connection: getRedisClient() })
    }
    return emailQueue
}

export {getEmailQueue}