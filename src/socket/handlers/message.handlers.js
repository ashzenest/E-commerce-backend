import { Message } from '../../models/message.model.js'
import { Chatroom } from '../../models/chatroom.model.js'
import mongoose from 'mongoose'

const handleMessageEvents = (io, socket) => {
    socket.on("send_message", async(data) => {
        try {
            const {chatroomId, content, messageType = "text"} = data
            const validTypes = ["text", "image"]
            if (!validTypes.includes(messageType)) {
                return socket.emit("error", {
                    success: false,
                    message: "Invalid message type"
                })
            }
            if(!chatroomId || !mongoose.Types.ObjectId.isValid(chatroomId)){
                return socket.emit("error", {
                    success: false,
                    message: "Invalid Chatroom Id format"
                })
            }
            if(!content){
                return socket.emit("error", {
                    success: false,
                    message: "Message content is required"
                })
            }
    
            const chatroom = await Chatroom.findOne({_id: chatroomId, $or: [{ createdBy: socket.userId }, { assignedTo: socket.userId }]})
            if(!chatroom){
                return socket.emit("error", {
                    success: false,
                    message: "Chatroom doesn't exist or you don't have access to it"
                })
            }
    
            const message = await Message.create({
                sender: socket.userId,
                chatroom: chatroomId,
                messageType,
                content
            })
    
            await message.populate("sender", "username avatar")
    
            const recipientId = chatroom.createdBy.toString() === socket.userId.toString()
                ?chatroom.assignedTo
                :chatroom.createdBy
    
            const messageData = {
                success: true,
                data: { message },
                message: "Message sent successfully"
            }
    
            socket.emit("message_sent", messageData)
            socket.to(`chatroom:${chatroomId}`).emit("new_message", messageData)
            if (recipientId) {
                io.to(`user:${recipientId}`).emit("new_message_notification", {
                    success: true,
                    data: {
                        chatroomId,
                        message
                    },
                    message: "New message received"
                })
            }
        } catch (error) {
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })
}

export {handleMessageEvents}