import client from "prom-client"

const publicRegistry = new client.Registry()
const privateRegistry = new client.Registry()

client.collectDefaultMetrics({
    register: privateRegistry
})

const httpTotalRequests = new client.Counter({
    name: "http_requests_total",
    help: "Total HTTP Request",
    labelNames: ["method", "route", "status_code"],
    registers: [publicRegistry]
})

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [privateRegistry]
})

const activeRequests = new client.Gauge({
    name: "active_requests",
    help: "Active requests",
    registers: [privateRegistry]
})

const cacheHitOrMissesTotal  = new client.Counter({
    name: "cache_hits_and_misses_total",
    help: "Total cache hits or misses",
    labelNames: ["model" , "result"],
    registers: [privateRegistry]
})

export {
    publicRegistry,
    privateRegistry,
    httpTotalRequests,
    httpRequestDuration,
    activeRequests,
    cacheHitOrMissesTotal
}