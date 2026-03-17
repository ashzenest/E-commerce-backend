import jwt from "jsonwebtoken"
import { User } from "../../models/user.model.js"

const socketAuth = async(socket, next) => {
    try {
        const token = socket.handshake?.auth?.token
        if(!token){
            return next(new Error("Authentication Error"))
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-refreshToken")
        if(!user){
            return next(new Error("User does not exist"))
        }
        if(user.status !== "active"){
            return next(new Error(`User is ${user.status}`))
        }

        socket.userId = user._id
        socket.username = user.username
        socket.role = user.role
        next()
    } catch(error){
        return next(new Error("Invalid Token"))
    }
}

export {socketAuth}