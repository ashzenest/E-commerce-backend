import { Chatroom } from "../models/chatroom.model.js"

const getUnreadSummary = async(userId) => { 
    const chatrooms = await Chatroom.aggregate([
        { $match: { $or: [{createdBy: userId}, {assignedTo: userId}] } }, 
        { $lookup: {
            from: 'messages',
            let: { roomId: '$_id' },
            pipeline: [
                { $match: {
                    $expr: {
                        $and: [
                            { $eq: ['$chatroom', '$$roomId'] },
                            { $ne: ['$sender', userId] },
                            { $eq: ['$isRead', false] }
                        ]
                    }
                }},
                { $count: 'count' }
            ],
            as: 'unreadMessages'
        }},
        
        { $addFields: {
            unreadCount: { 
                $ifNull: [{ $arrayElemAt: ['$unreadMessages.count', 0] }, 0] 
            }
        }},
        
        { $project: { unreadMessages: 0 } },
        { $sort: { lastMessageAt: -1 } }
    ])
    await Chatroom.populate(chatrooms, {
        path: 'assignedTo',
        select: 'username avatar'
    })
    return chatrooms
}

export {getUnreadSummary}