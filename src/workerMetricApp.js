import express from "express";
import { privateRegistry } from "./config/metric/worker.metrics.js";
import { logger } from "./config/logger.config.js";

const workerMetricApp = express()

const isInternal = (req, res, next) => {
    if(req.header("x-metrics-secret") !== process.env.WORKER_METRICS_APP_SECRET){
        return res.status(403).json({error: "Forbidden"})
    }
    next()
}

workerMetricApp.get("/", isInternal, async (req, res) => {
    res.set("Content-Type", privateRegistry.contentType)
    res.send(await privateRegistry.metrics())
})

const startWorkerMetricApp = () => {
    workerMetricApp.listen(process.env.WORKER_METRICS_APP_PORT, () => {
        logger.info(`Worker metric app is listening on port ${process.env.WORKER_METRICS_APP_PORT}`)
    })
}

export {startWorkerMetricApp}