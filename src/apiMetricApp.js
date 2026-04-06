import express from "express"
import { privateRegistry, publicRegistry } from "./config/metric/api.metrics.js"
import { logger } from "./config/logger.config.js"

const apiMetricsApp = express()

const isInternal = async(req, res, next) => {
    if(req.header("x-metrics-secret") !== process.env.API_METRICS_APP_SECRET){
        return res.status(403).json({error: "Forbidden"})
    }
    next()
}

apiMetricsApp.get("/metrics", async(req, res) => {
    res.set("Content-Type", publicRegistry.contentType)
    res.send(await publicRegistry.metrics())
})

apiMetricsApp.get("/metrics/private", isInternal, async (req, res) => {
    res.set("Content-Type", privateRegistry.contentType)
    res.send(await privateRegistry.metrics())
})
//const mergedRegistry = Registry.merge([registry1, registry2])

const startApiMetricApp = () => {
    apiMetricsApp.listen(process.env.API_METRIC_APP_PORT, () => {
        logger.info(`Api metric app is listening on port ${process.env.API_METRIC_APP_PORT}`)
    })
}

export {startApiMetricApp}
