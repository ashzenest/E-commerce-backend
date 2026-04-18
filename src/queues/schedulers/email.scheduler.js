import crypto from "crypto";
import mongoose from "mongoose";
import { logger } from "../../config/logger.config.js"
import { Product } from "../../models/product.model.js"
import { addSendLowStockEmailToQueue } from "../producers/email.producer.js"
import { getRedisClient } from "../../config/valkey.config.js";

const sendLowStockEmailJob = async () => {
    const cronReqId = `cron-lowstock-${crypto.randomUUID().substring(0, 8)}`

    const log = logger.child({
        reqId: cronReqId,
        phase: "cronJob",
        operation: "sendLowStockEmailJob"
    })
    log.info("Add low stock product alert to queue started")
    const today = new Date().toISOString().split('T')[0];

    let cursor

    try {
        cursor = await Product.find({status: "active", stock: {$lte: 5}, isNotified: false}).select("seller name stock").populate("seller", "fullname email").lean().cursor()
    
        let batch = []
        
        for(let product = await cursor.next(); product !== null; product = await cursor.next()){
            batch.push({
                name: "sendLowStockProductEmail",
                data: {
                    reqId: cronReqId,
                    productId: product._id.toString(),
                    productName: product.name,
                    productStock: product.stock,
                    fullname: product.seller.fullname,
                    email: product.seller.email
                },
                opts: {
                    attempts: 5,
                    backoff: {
                        type: "exponential", delay: 1000
                    },
                    removeOnComplete: true,
                    removeOnFail: {
                        age: 60*60*24
                    },
                    jobId: `low-stock-alert-${product._id.toString()}-${today}`//if this cronjob run twice same day to avoid sending email once again
                }})
    
            try {
                if(batch.length === 20){
                    await addSendLowStockEmailToQueue(batch)
                }
            } catch (err) {
                log.error("could not add one batch to low-stock-alert email queue")
            } finally {
                batch = []
            }
        }
    
        if(batch.length > 0){
            await addSendLowStockEmailToQueue(batch)
        }
        log.info("Low stock email job finished dispatching")
    } catch (err) {
        log.error({err}, "Error during run sendLowStockEmailJob")
    } finally{
        await cursor?.close()
    }
}

const flushLowStockBuffer = async() => {
    const log = logger.child({
        phase: "cronJob",
        cron: "flushLowStockBuffer"
    })
    log.info("Flush low stock buffer cron-job is running")

    const oldKey = "low-stock-alert"
    const newKey = `low-stock-alert:processing`
    const luaScript = `
        if redis.call("EXISTS", KEYS[1]) == 1 then
            redis.call("SUNIONSTORE", KEYS[2], KEYS[1], KEYS[2])
            redis.call("DEL", KEYS[1])    
        end
        local members = redis.call("SMEMBERS", KEYS[2])
        if #members == 0 then
            return nil
        end
        return members
        `;
    try{
        const result = await getRedisClient().eval(luaScript, 2, oldKey, newKey)//ioredis give you js array from lua table
        if(!result || result.length === 0){
            log.info("Finished running low stock buffer cron-job")
            return
        }
        const productIds = result.map(product => new mongoose.Types.ObjectId(product))//i should maybe batch this before updateMany (what if productIds have 10000 ids?)
        const updateResult = await Product.updateMany({_id: {$in: productIds}, isNotified: false}, {$set: {isNotified: true}})
        if(updateResult.acknowledged){
            await getRedisClient().del(newKey)
        }
        log.info("Finished running low stock buffer cron-job")
    } catch(err){
        log.error({err}, "Error during cron-job")//silent fail since it will mostly be about failed db write so avoid crashing the worker 
    }
}

export {
    sendLowStockEmailJob,
    flushLowStockBuffer
}