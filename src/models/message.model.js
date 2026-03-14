import mongoose from "mongoose"
import { ChatRoom } from "./chatRoom.model.js"

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatRoom",
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

messageSchema.index({ chatRoom: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

messageSchema.post("save", async function(){
    await ChatRoom.findByIdAndUpdate(this.chatRoom, {
        lastMessageAt: new Date()
    })
})

export const Message = mongoose.model("Message", messageSchema)