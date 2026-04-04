import fs from "fs"
import { cloudinary } from "../config/cloudinary.config.js"
import { logger } from "../config/logger.config.js"

const uploadOnCloudinary = async(localFilePath, reqId) => {
    const log = logger.child({
        phase: "cloudinary",
        operation: "uploadOnCloudinary",
        reqId
    })
    log.info("Upload on cloudinary started")
    try {
        if(!localFilePath){
            return false
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        log.info("Upload on cloudinary successful")
        return response
    } catch(err) {
        log.error({err}, "Failed to upload image to cloudinary")
        return false
    } finally {
        try {
            await fs.promises.access(localFilePath)
            await fs.promises.unlink(localFilePath)
        } catch(err) {
            log.debug({err}, "File doesn't exist or is inaccessible")
        }
    }
}

const deleteFromCloudinary = async(filePublicId, reqId) => {
    const log = logger.child({
        phase: "cloudinary",
        operation: "deleteFromCloudinary",
        reqId
    })
    log.info("Delete from cloudinary started")
    try {
        const response = await cloudinary.uploader.destroy(filePublicId, {
            resource_type: "auto"
        })
        if(response.result === "ok"){
            log.info({ filePublicId }, "File deleted from cloudinary successfully")
            return true
        }
        log.warn({filePublicId}, "File not found or already deleted:")
        return true
    } catch (err) {
        log.error({err, filePublicId}, "Cloudinary deletion failed")
        throw err
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}