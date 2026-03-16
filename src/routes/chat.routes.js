import { Router } from "express";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { blacklistCheck } from "../middlewares/blacklist.middleware.js";
import { assignChatroomToSelf, closeChatroom, createChatroom, getAllChatrooms, getMessages, getUserChatrooms, markMessagesAsRead } from "../controllers/chat.controllers.js";

const router = Router()

router.use(verifyJWT, blacklistCheck)

router.route("/chatrooms").post(createChatroom)
router.route("/chatrooms").get(getUserChatrooms)
router.route("/chatrooms/:chatroomId/messages").get(getMessages)
router.route("/chatrooms/:chatroomId/read").patch(markMessagesAsRead)

router.use(authorizeRoles("admin"))

router.route("/chatrooms/:chatroomId/assign").patch(assignChatroomToSelf)
router.route("/chatrooms/:chatroomId/close").patch(closeChatroom)
router.route("/admin/chatrooms").get(getAllChatrooms)

export default router