import mongoose from "mongoose";
import { logger } from "./logger.config.js";

const connectDatabase = async() => {
    logger.info("Connecting to Database")
    for(let i = 0; i<5; i++){
        try{
            await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
            logger.info("Successfully connected to Database")
            return
        }catch(err){
            logger.error({
                err,
                attempt: i + 1,
                retryInMs: 2000 * (i + 1)
            }, `Connection failed for ${i + 1} time`)
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
        }
    }
    logger.catastrophe("Database connection failed after maximum retries")
    process.exit(1)
}

export {connectDatabase}