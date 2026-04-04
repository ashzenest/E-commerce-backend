import { deleteFromCloudinary } from "../services/cloudinary.service.js";

const cloudinaryActions = {
    deleteFromCloudinary: (data) => deleteFromCloudinary(data.filePublicId, data.reqId)
}

export {cloudinaryActions}