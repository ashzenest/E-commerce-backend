import "dotenv/config";
import "./config/email.config.js";
import "./config/cloudinary.config.js";
import { connectDatabase } from "./db/index.js";
import { app } from "./app.js";
import { redisClient } from "./config/redis.config.js";

const start = async() => {
    await connectDatabase()
    await redisClient.connect()
    app.listen(process.env.PORT || 5000, () => {
        console.log("App is working")
    })
}

start().catch((error) => {
    console.error(error);
    process.exit(1);
})