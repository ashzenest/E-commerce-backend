import { GlideClient } from "@valkey/valkey-glide";
import Redis from "ioredis";
import { logger } from "./logger.config.js";

// Two separate clients are intentional:
// - GlideClient is used for app-level cache/auth operations (valkey-glide is the official client for Valkey)
// - ioredis is used exclusively for BullMQ, because BullMQ require ioredis
// valkey-glide does not implement the ioredis API and cannot be used with BullMQ

let valkeyClient = null
let redisClient = null

const connectValkey = async() => {
    logger.info("Connecting to Valkey")
    for(let i = 0; i < 5; i++){
        try {
            valkeyClient = await GlideClient.createClient({
                addresses: [{
                    host: process.env.VALKEY_HOST,
                    port: parseInt(process.env.VALKEY_PORT)
                }]
            });
            logger.info("Valkey connected");
            return;
        } catch(err){
            logger.error({
                err,
                attempt: i + 1,
                retryInMs: 2000 * (i + 1)
            }, `Valkey connection failed attempt ${i + 1}`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
    logger.catastrophe("Valkey connection failed after maximum tries");
    process.exit(1);
}

const connectRedis = async() =>{
    logger.info("Connecting to Redis")
    for(let i = 0; i < 5; i++){
        try {
            redisClient = new Redis({
                port: process.env.VALKEY_PORT,
                host: process.env.VALKEY_HOST,
                db: 1,
                lazyConnect: true,
                maxRetriesPerRequest: null
            });
            await redisClient.connect()
            logger.info("Redis connected");
            return;
        } catch(err){
            logger.error({
                err,
                attempt: i + 1,
                retryInMs: 2000 * (i + 1)
            }, `Redis connection failed attempt ${i + 1}`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
    logger.catastrophe("Redis connection failed after maximum tries");
    process.exit(1);
}

const getValkeyClient = () => {
    if(!valkeyClient){
        throw new Error("Valkey not initialized")
    }
    return valkeyClient
}

const getRedisClient = () => {
    if(!redisClient){
        throw new Error("Redis not initialized")
    }
    return redisClient
}

export {
    connectValkey,
    getValkeyClient,
    connectRedis,
    getRedisClient
}