const workerShutdownHandler = (resources) => {
    let isShuttingDown = false
    return async(signal = "STARTUP_FAILURE") => {

        if(isShuttingDown) return

        isShuttingDown = true

        const {emailWorkerInstance, cloudinaryWorkerInstance, redisInstance, workerMetricAppInstance, logger} = resources

        logger.info(`Received ${signal}, shutting down the server...`)

        const timer = setTimeout(() => {
            logger.error("Shutdown timed out, force exiting")
            process.exit(1)
        }, 25000)
        timer.unref()

        try {
            if(emailWorkerInstance) await emailWorkerInstance.close()
            if(cloudinaryWorkerInstance) await cloudinaryWorkerInstance.close()
            if(redisInstance) await redisInstance.quit()
            if(workerMetricAppInstance) await stopServer(workerMetricAppInstance)
            if(logger) await logger.flush()
            process.exit(0)
        } catch (err) {
            logger.error({err}, "Error during shutdown, force shutting down")
            process.exit(1)
        }
    }
}

const stopServer = async(server) => {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if(err) reject(err)
            else resolve()
        })
    })
}

export {workerShutdownHandler}