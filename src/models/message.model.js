import mongoose from "mongoose"
import { Chatroom } from "./chatroom.model.js"

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    chatroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chatroom",
        required: true
    },
    messageType: {
        type: String,
        enum: ["text", "image"],
        default: "text"
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
},{timestamps: true})

messageSchema.index({ chatroom: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

messageSchema.post("save", async function(){
    await Chatroom.findByIdAndUpdate(this.chatroom, {
        lastMessageAt: new Date()
    })
})

export const Message = mongoose.model("Message", messageSchema)