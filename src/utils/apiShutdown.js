const shutdownHandler = (resources) => {
    let isShuttingDown = false
    return async (signal = "STARTUP_FAILURE") => {

        if(isShuttingDown) return

        isShuttingDown = true

        const {server, apiMetricAppInstance, io, databaseInstance, valkeyInstance, logger} = resources
        
        logger.info(`Received ${signal}, shutting down the server...`)

        const timer = setTimeout(() => {
            logger.error("Shutdown timed out, force exiting")
            process.exit(1)
        }, 25000)
        timer.unref()

        try {
            if(server) await stopServer(server)
            if(apiMetricAppInstance) await stopServer(apiMetricAppInstance)
            if(io) await new Promise((resolve) => io.close(resolve))
            if(valkeyInstance) await valkeyInstance.close()
            if(databaseInstance) await databaseInstance.disconnect()
            if(logger) await logger.flush()
            process.exit(0)
        } catch(err) {
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

export {shutdownHandler}