import mongoose from 'mongoose'
import { getMessagesByChatroom } from '../../services/message.service.js'
import { Chatroom } from '../../models/chatroom.model.js'
import { Message } from '../../models/message.model.js'

const handleRoomEvents = (io, socket, log) => {
    socket.on('join_chatrooms', async (data) => {
        const joinChatroomLog = log.child({
            operation: "join_chatrooms",
            chatroomId: data?.chatroomId
        })
        joinChatroomLog.info("Join chatroom initiated")

        try {
            const {chatroomId, page} = data
            if(!chatroomId || !mongoose.Types.ObjectId.isValid(chatroomId)){
                joinChatroomLog.warn("Invalid chatroomId received")
                return socket.emit("error", {
                    success: false,
                    message: "Invalid Chatroom Id"
                })
            }
    
            const chatroom = await Chatroom.findOne({_id: chatroomId, $or: [{createdBy: socket.userId}, {assignedTo: socket.userId}]})
            if(!chatroom){
                joinChatroomLog.warn("Chatroom not found or access denied")
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
            joinChatroomLog.info("Join chatroom completed")
        } catch (err) {
            joinChatroomLog.error({err}, "Join chatroom operation failed")
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })

    socket.on('leave_chatroom', ({ chatroomId }) => {
        const leaveChatroomLog = log.child({
            operation: "leave_chatroom",
            chatroomId
        })
        leaveChatroomLog.info("Leave chatroom initiated")

        try {
            if (!chatroomId) return
            socket.leave(`chatroom:${chatroomId}`)
            leaveChatroomLog.info("Leave chatroom completed")
        } catch (err) {
            leaveChatroomLog.error({err}, "Leave chatroom failed")
            socket.emit("error", { success: false, message: "Internal server error" })
        }
    })
}

export {handleRoomEvents}