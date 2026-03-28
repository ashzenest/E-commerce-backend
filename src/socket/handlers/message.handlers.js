import { Message } from '../../models/message.model.js'
import { Chatroom } from '../../models/chatroom.model.js'
import mongoose from 'mongoose'

const handleMessageEvents = (io, socket, log) => {
    socket.on("send_message", async(data) => {
        const sendMessageLog = log.child({
            operation: "send_message",
            chatroomId: data?.chatroomId
        })
        sendMessageLog.info("Send message initiated")

        try {
            const {chatroomId, content, messageType = "text"} = data
            const validTypes = ["text", "image"]
            if (!validTypes.includes(messageType)) {
                sendMessageLog.warn({ messageType }, "Invalid message type received")
                return socket.emit("error", {
                    success: false,
                    message: "Invalid message type"
                })
            }
            if(!chatroomId || !mongoose.Types.ObjectId.isValid(chatroomId)){
                sendMessageLog.warn("Invalid chatroomId received")
                return socket.emit("error", {
                    success: false,
                    message: "Invalid Chatroom Id format"
                })
            }
            if(!content){
                sendMessageLog.warn("Message content missing")
                return socket.emit("error", {
                    success: false,
                    message: "Message content is required"
                })
            }
    
            const chatroom = await Chatroom.findOne({_id: chatroomId, $or: [{ createdBy: socket.userId }, { assignedTo: socket.userId }]})
            if(!chatroom){
                sendMessageLog.warn("Chatroom not found or access denied")
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
            sendMessageLog.info("Send message completed")
        } catch (err) {
            sendMessageLog.error({err}, "Send message failed")
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })
}

export {handleMessageEvents}