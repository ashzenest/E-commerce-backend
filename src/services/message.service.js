import { Message } from "../models/message.model.js"

const getMessagesByChatroom = async(chatroomId, page = 1, limit = 50) => {
    const skip = (page - 1) * limit
    const totalMessages = await Message.countDocuments({chatroom: chatroomId})
    const messages = await Message.find({chatroom: chatroomId}).populate("sender", "username avatar").sort({createdAt: -1}).skip(skip).limit(limit)
    return {
        messages,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
            limit
        }
    }
}

export {getMessagesByChatroom}