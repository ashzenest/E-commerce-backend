const errorMiddleware  = (err, req, res, next) => {

    if(err.name === "ValidationError"){
        req.log.warn({err}, "Validation Error")

        const errorMessage = Object.values(err.errors)
            .map((value) => value.message)
        return res.status(400).json({
            statusCode: 400,
            data: null,
            message: "Validation Error",
            success: false,
            errors: errorMessage
        })
    }

    const statusCode = err.statusCode ?? 500
    const message = err.message ?? "Internal Server Error"

    if(statusCode >= 500){
        req.log.error({err}, message)
    } else {
        req.log.warn({err}, message)
    }

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false,
        errors: err.errors ?? [] 
    })
}

export {errorMiddleware}