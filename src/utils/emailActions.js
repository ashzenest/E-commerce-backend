import { sendChangeEmailRequest, sendForgetPasswordEmail, sendLowStockEmail, sendRegistrationEmail } from "../services/email.service.js"

const emailActions = {
    sendChangeEmailRequest: (data) => sendChangeEmailRequest(data.email, data.fullname, data.magicLink, data.reqId),
    sendForgetPasswordEmail: (data) => sendForgetPasswordEmail(data.email, data.fullname, data.magicLink, data.reqId),
    sendRegistrationEmail: (data) => sendRegistrationEmail(data.email, data.fullname, data.reqId),
    sendLowStockEmail: (data) => sendLowStockEmail(data.email, data.fullname, data.productName, data.productStock, data.reqId)
}

export {emailActions}