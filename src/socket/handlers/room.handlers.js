import mongoose from 'mongoose'
import { getMessagesByChatroom } from '../../services/message.service.js'
import { Chatroom } from '../../models/chatroom.model.js'
import { Message } from '../../models/message.model.js'

const handleRoomEvents = (io, socket) => {
    socket.on('join_chatrooms', async (data) => {
        try {
            const {chatroomId, page} = data
            if(!chatroomId || !mongoose.Types.ObjectId.isValid(chatroomId)){
                return socket.emit("error", {
                    success: false,
                    message: "Invalid Chatroom Id"
                })
            }
    
            const chatroom = await Chatroom.findOne({_id: chatroomId, $or: [{createdBy: socket.userId}, {assignedTo: socket.userId}]})
            if(!chatroom){
                return socket.emit("error", {
                    success: false,
                    message: "Chatroom doesn't exist or you don't have access to it"
                })
            }
    
            socket.join(`chatroom:${chatroomId}`)
    
            await Message.updateMany({chatroom: chatroomId, sender: {$ne: socket.userId}, isRead: false}, {
                $set: {isRead: true}
            })
    
            const { messages, pagination } = await getMessagesByChatroom(chatroomId, page)
            socket.emit("message_history", {
                success: true,
                data: {chatroomId, messages, pagination},
                message: "Messages fetched successfully"
            })
        } catch (error) {
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })

    socket.on('leave_chatroom', ({ chatroomId }) => {
        try {
            if (!chatroomId) return
            socket.leave(`chatroom:${chatroomId}`)
        } catch (error) {
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })
}

export {handleRoomEvents}