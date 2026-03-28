import jwt from "jsonwebtoken"
import { User } from "../../models/user.model.js"
import { logger } from "../../config/logger.config.js"

const socketAuth = async(socket, next) => {
    const socketLog = logger.child({
        module: "socket",
        operation: "socketAuth"
    })
    socketLog.info("Socket auth check started")
    try {
        const token = socket.handshake?.auth?.token
        if(!token){
            socketLog.warn("No token provided")
            return next(new Error("Authentication Error"))
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-refreshToken")
        if(!user){
            socketLog.warn({ userId: decodedToken._id }, "User not found during socket auth")
            return next(new Error("User does not exist"))
        }
        if(user.status !== "active"){
            socketLog.warn({ userId: user._id, status: user.status }, "Inactive user attempted connection")
            return next(new Error(`User is ${user.status}`))
        }

        socket.userId = user._id
        socket.username = user.username
        socket.role = user.role
        socketLog.info("Socket auth successful")
        next()
    } catch(err){
        socketLog.warn({err}, "Socket auth failed")
        return next(new Error("Invalid Token"))
    }
}

export {socketAuth}