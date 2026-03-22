import fs from "fs"
import { cloudinary } from "../config/cloudinary.config.js"

const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath){
            return null
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath)
        return null
    }
    
}

const deleteFromCloudinary = async(filePublicId) => {
    try {
        const response = await cloudinary.uploader.destroy(filePublicId, {
            resource_type: "auto"
        })
        if(response.result === "ok"){
            return response
        }
        console.warn("File not found or already deleted:", filePublicId)
        return true
    } catch (error) {
        console.error("Cloudinary deletion failed:", error)
        return false
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}