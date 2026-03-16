import mongoose from "mongoose";

const chatroomSchema = new mongoose.Schema({
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

chatroomSchema.virtual("messages", {
    ref: "Message",
    localField: "_id",
    foreignField: "chatroom"
})

chatroomSchema.set("toJSON", {virtuals: true})
chatroomSchema.set("toObject", {virtuals: true})

chatroomSchema.index({ createdBy: 1 })
chatroomSchema.index({ assignedTo: 1 })
chatroomSchema.index({ status: 1 })

export const Chatroom = mongoose.model("Chatroom", chatroomSchema)