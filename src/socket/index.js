import { Server } from "socket.io";
import { handleRoomEvents } from "./handlers/room.handlers.js";
import { handleMessageEvents } from "./handlers/message.handlers.js";
import { handleTypingEvents } from "./handlers/typing.handlers.js";
import { socketAuth } from "./middlewares/socketAuth.js";
import { User } from "../models/user.model.js";
import { getUnreadSummary } from "../services/chatroom.service.js";

let io = null

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }
    })

    io.use(socketAuth)

    io.on("connection", async (socket) => {
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
    
            handleRoomEvents(io, socket)
            handleMessageEvents(io, socket)
            handleTypingEvents(io, socket)
    
            socket.on("disconnect", async () => {
                try {
                    const sockets = await io.in(`user:${socket.userId}`).fetchSockets()
                    if(sockets.length === 0){
                        await User.findByIdAndUpdate(socket.userId, {
                            $set: {isOnline: false, lastOnlineAt: new Date()}
                        })
                    }
                } catch (error) {
                    console.error("Disconnect handler error:", error)
                }
            })
        } catch (error) {
            console.error("Connection handler error:", error)
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