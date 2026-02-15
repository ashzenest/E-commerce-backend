const extractPublicId = (cloudinaryUrl) => {
  try {
    if(!cloudinaryUrl || !cloudinaryUrl.includes("/upload/")){
        return null
    }
    const uploadIndex = cloudinaryUrl.indexOf('/upload/') + 8
    const afterUpload = cloudinaryUrl.substring(uploadIndex)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '')
  
    return withoutVersion.substring(0, withoutVersion.lastIndexOf('.'))
  } catch (error) {
    console.error("Failed to extract public ID:", error.message)
    return null
  }
}

export {extractPublicId}