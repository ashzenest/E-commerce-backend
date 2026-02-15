import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

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
        return null
    } catch (error) {
        console.error("Cloudinary deletion failed:", error)
        return null
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}