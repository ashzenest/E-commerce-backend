import { Server } from "socket.io";
import { handleRoomEvents } from "./handlers/room.handlers.js";
import { handleMessageEvents } from "./handlers/message.handlers.js";
import { handleTypingEvents } from "./handlers/typing.handlers.js";
import { socketAuth } from "./middlewares/socketAuth.js";
import { User } from "../models/user.model.js";
import { getUnreadSummary } from "../services/chatroom.service.js";
import {logger} from "../config/logger.config.js"

let io = null

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }
    })
    io.engine.on("connection_error", (err) => {
        logger.error({ err }, "Socket.io connection error")
    })

    io.use(socketAuth)

    io.on("connection", async (socket) => {
        const log = logger.child({
            module: "socket",
            userId: socket.userId
        })
        log.info("User connected")

        socket.on("error", (err) => {
            log.error({ err }, "Socket transport error")
        })

        try {
            socket.join(`user:${socket.userId}`)
    
            const unreadSummary = await getUnreadSummary(socket.userId)
            socket.emit("unread_summary", unreadSummary)
    
            if(socket.role === "admin"){
                socket.join("admins:queue")
            }
    
            await User.findByIdAndUpdate(socket.userId, {
                $set: {isOnline: true}
            })
    
            handleRoomEvents(io, socket, log)
            handleMessageEvents(io, socket, log)
            handleTypingEvents(io, socket)
    
            socket.on("disconnect", async () => {
                log.info("Disconnect user initiated")
                try {
                    const sockets = await io.in(`user:${socket.userId}`).fetchSockets()
                    if(sockets.length === 0){
                        await User.findByIdAndUpdate(socket.userId, {
                            $set: {isOnline: false, lastOnlineAt: new Date()}
                        })
                    }
                } catch (err) {
                    log.error({err}, "Disconnect handler error")
                }
            })
        } catch (err) {
            log.error({err}, "Socket setup failed")
            socket.disconnect()
        }
    })
    return io
}

const getIO = () => {
    if(!io){
        throw new Error("Socket.io is not initialized")
    }
    return io
}

export {
    initializeSocket,
    getIO
}