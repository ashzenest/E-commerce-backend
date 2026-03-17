import mongoose from 'mongoose'

const handleTypingEvents = (io, socket) => { 
    socket.on('typing', ({ chatroomId }) => {
        try {
            if (!chatroomId || !mongoose.Types.ObjectId.isValid(chatroomId)) {
                return socket.emit("error", {
                    success: false,
                    message: "Invalid Chatroom Id format"
                })
            }
            socket.to(`chatroom:${chatroomId}`).emit('user_typing', {
               success: true,
               data: {userId: socket.userId, username: socket.username},
               message: "User is typing"
            })
        } catch (error) {
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })

    socket.on('stop_typing', ({ chatroomId }) => {
        try {
            if (!chatroomId || !mongoose.Types.ObjectId.isValid(chatroomId)) {
                return socket.emit("error", {
                    success: false,
                    message: "Invalid Chatroom Id"
                })
            }
            socket.to(`chatroom:${chatroomId}`).emit('user_stopped_typing', {
                success: true,
                data: {userId: socket.userId, username: socket.username},
                message: "User stopped typing"
            })
        } catch (error) {
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })
}

export {handleTypingEvents}