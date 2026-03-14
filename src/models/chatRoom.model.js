import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: ["customer-support", "seller-support"],
        required: true
    },
    status: {
        type: String,
        enum: ["open", "assigned", "closed"],
        default: "open"
    },
    lastMessageAt: {
        type: Date
    }
}, {timestamps: true})

chatRoomSchema.virtual("messages", {
    ref: "Message",
    localField: "_id",
    foreignField: "chatRoom"
})

chatRoomSchema.set("toJSON", {virtuals: true})
chatRoomSchema.set("toObject", {virtuals: true})

chatRoomSchema.index({ createdBy: 1 })
chatRoomSchema.index({ assignedTo: 1 })
chatRoomSchema.index({ status: 1 })

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema)