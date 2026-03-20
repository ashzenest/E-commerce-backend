import "dotenv/config";
import "./config/email.config.js";
import "./config/cloudinary.config.js";
import http from "http"
import { connectDatabase } from "./config/database.config.js";
import { app } from "./app.js";
import { connectValkey } from "./config/valkey.config.js";
import { initializeSocket } from "./socket/index.js";
import { logger } from "./config/logger.config.js";

const server = http.createServer(app)

const start = async() => {
    logger.info("Server is starting")
    await connectDatabase()
    await connectValkey()
    initializeSocket(server)
    server.listen(process.env.PORT || 5000, () => {
        logger.info({ port: process.env.PORT || 5000 }, "Server started")
    })
}

start().catch((err) => {
    logger.catastrophe({err}, "Server failed to start");
    process.exit(1);
})