import client from "prom-client"

const privateRegistry = new client.Registry()

client.collectDefaultMetrics({
    register: privateRegistry
})

const queueDepth = new client.Gauge({
    name: "queue_depth",
    help: "Number of jobs currently in queue",
    labelNames: ["queue"],
    registers: [privateRegistry]
})

const jobsTotal = new client.Counter({
    name: "jobs_total",
    help: "Total jobs processed",
    labelNames: ["queue", "status"],
    registers: [privateRegistry]
})

const jobDurations = new client.Histogram({
    name: "job_duration_seconds",
    help: "Time taken to process a job",
    labelNames: ["queue"],
    buckets: [0.1, 0.5, 1, 2, 3, 4, 5],
    registers: [privateRegistry]
})

const jobRetriesTotal = new client.Counter({
    name: "job_retries_total",
    help: "Total job retry attempts",
    labelNames: ["queue"],
    registers: [privateRegistry]
})

export {
    privateRegistry,
    queueDepth,
    jobsTotal,
    jobDurations,
    jobRetriesTotal
}