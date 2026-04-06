import { activeRequests, httpRequestDuration, httpTotalRequests } from "../config/metric/api.metrics.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const metricsMiddleware = asyncHandler((req, res, next) => {
    activeRequests.inc()
    const end = httpRequestDuration.startTimer()
    res.on("finish", () => {
        const label = {
            method: req.method,
            route: req.route?.path ?? req.path,
            status_code: res.statusCode
        }
        httpTotalRequests.inc(label)
        end(label)
        activeRequests.dec()
    })
    next()
})

export {metricsMiddleware}