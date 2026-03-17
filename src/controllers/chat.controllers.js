import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Chatroom } from "../models/chatroom.model.js"
import { Message } from "../models/message.model.js"
import mongoose from "mongoose"
import { getUnreadSummary } from "../services/chatroom.service.js"
import { getMessagesByChatroom } from "../services/message.service.js"
import { getIO } from "../socket/index.js"

const createChatroom = asyncHandler(async (req, res) => {
    const {typeRequested} = req.body
    const userId = req.user._id

    const type = typeRequested?.trim()
    if(!type){
        throw new ApiError(400, "Chatroom type is required")
    }
    const validTypes = ["customer-support", "seller-support"]
    if(!validTypes.includes(type)){
        throw new ApiError(400, "Chatroom type is incorrect")
    }

    const existingChatroom = await Chatroom.findOne({createdBy: userId, $or:[{status: "open"}, {status: "assigned"}]})
    if(existingChatroom){
        throw new ApiError(400, "User already has an open/assigned chatroom")
    }
    const chatroom = await Chatroom.create({
        createdBy: userId,
        type
    })
    const io = getIO()
    io.to("admins:queue").emit("new_chatroom", {
        success: true,
        data: { chatroom },
        message: "New chatroom created"
    })

    return res.status(201).json(new ApiResponse(201, chatroom, "Chatroom created successfully"))
})

const getUserChatrooms = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const chatrooms = await getUnreadSummary(userId)
    return res.status(200).json(new ApiResponse(200, chatrooms, "All Chatroom fetched successfully"))
})

const assignChatroomToSelf = asyncHandler(async (req, res) => {
    const {chatroomId} = req.params
    if(!mongoose.Types.ObjectId.isValid(chatroomId)){
        throw new ApiError(400, "Invalid Chatroom Id")
    }
    const chatroom = await Chatroom.findOneAndUpdate({_id: chatroomId, status: "open"}, {
        $set: {assignedTo: req.user._id, status: "assigned"}
    }, {new: true})
    if(!chatroom){
        throw new ApiError(404, "Chatroom not found or already assigned")
    }
    const io = getIO()
    io.to(`user:${chatroom.createdBy}`).emit("chatroom_assigned", {
        success: true,
        data: { chatroom },
        message: "Your chatroom has been assigned to a support agent"
    })
    return res.status(200).json(new ApiResponse(200, chatroom, "Chatroom is assigned to you successfully"))
})

const closeChatroom = asyncHandler(async (req, res) => {
    const {chatroomId} = req.params
    if(!mongoose.Types.ObjectId.isValid(chatroomId)){
        throw new ApiError(400, "Invalid Chatroom Id")
    }
    const chatroom = await Chatroom.findOneAndUpdate({_id: chatroomId, status: "assigned", assignedTo: req.user._id}, {
        $set: {status: "closed"}
    }, {new: true})
    if(!chatroom){
        throw new ApiError(404, "Chatroom not found or not assigned to you")
    }
    const io = getIO()
    io.to(`chatroom:${chatroomId}`).emit("chatroom_closed", {
        success: true,
        data: { chatroom },
        message: "Chatroom has been closed"
    })
    io.to(`user:${chatroom.createdBy}`).emit("chatroom_closed", {
        success: true,
        data: { chatroom },
        message: "Chatroom has been closed"
    })
    return res.status(200).json(new ApiResponse(200, chatroom, "Chatroom closed successfully"))
})

const getAllChatrooms = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {}

    if(req.query.type){
        const validTypes = ["customer-support", "seller-support"]
        if(!validTypes.includes(req.query.type)){
            throw new ApiError(400, "Invalid query type")
        }
        filter.type = req.query.type
    }
    if(req.query.status){
        const validStatuses = ["open", "assigned", "closed"]
        if(!validStatuses.includes(req.query.status)){
            throw new ApiError(400, "Invalid query status")
        }
        filter.status = req.query.status
    }
    if(req.query.assignedTo){
        if(!mongoose.Types.ObjectId.isValid(req.query.assignedTo)){
            throw new ApiError(400, "Invalid User Id")
        }
        filter.assignedTo = req.query.assignedTo
    }
    if(req.query.createdBy){
        if(!mongoose.Types.ObjectId.isValid(req.query.createdBy)){
            throw new ApiError(400, "Invalid User Id")
        }
        filter.createdBy = req.query.createdBy
    }

    const totalChatrooms = await Chatroom.countDocuments(filter)
    const chatrooms = await Chatroom.find(filter).sort({lastMessageAt: -1, createdAt: -1}).populate("createdBy", "username avatar").populate("assignedTo", "username avatar").skip(skip).limit(limit)

    return res.status(200).json(new ApiResponse(200, {
        chatrooms,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalChatrooms / limit),
            totalChatrooms,
            limit
        }
    }, "All chatrooms fetched successfully"))
})

const getMessages = asyncHandler(async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50

    const {chatroomId} = req.params
    if(!mongoose.Types.ObjectId.isValid(chatroomId)){
        throw new ApiError(400, "Invalid Chatroom Id")
    }
    const chatroom = await Chatroom.findOne({_id: chatroomId, $or: [{assignedTo: req.user._id}, {createdBy: req.user._id}]})
    if(!chatroom){
        throw new ApiError(404, "Chatroom doesnt exist or you dont have access to it")
    }
    const data = await getMessagesByChatroom(chatroomId, page, limit)
    return res.status(200).json(new ApiResponse(200, data, "Messages fetched successfully"))
})

const markMessagesAsRead = asyncHandler(async (req, res) => {
    const {chatroomId} = req.params
    if(!mongoose.Types.ObjectId.isValid(chatroomId)){
        throw new ApiError(400, "Invalid Chatroom Id")
    }
    const chatroom = await Chatroom.findOne({_id: chatroomId, $or: [{createdBy: req.user._id}, {assignedTo: req.user._id}]})
    if(!chatroom){
        throw new ApiError(403, "You are not authorized to perform this operation")
    }
    await Message.updateMany({chatroom: chatroomId, sender: {$ne: req.user._id}, isRead: false}, {
        $set: {isRead: true}
    })
    return res.status(200).json(new ApiResponse(200, {}, "Messages marked as read successfully"))
})

export {
    createChatroom,
    getUserChatrooms,
    assignChatroomToSelf,
    closeChatroom,
    getAllChatrooms,
    getMessages,
    markMessagesAsRead
}