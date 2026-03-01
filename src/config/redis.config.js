import { createClient } from "redis";

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
})

redisClient.on("connect", () => console.log("Redis connected"))
redisClient.on("error", (err) => console.error("Redis error:", err))

export {redisClient}