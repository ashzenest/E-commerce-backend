import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

//Register user accept everything in string format or it crash-- fix that later
const registerUser = asyncHandler(async (req, res) => {
    const {username, fullname, email, password} = req.body

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser){
        throw new ApiError(400, "username or email already taken")
    }

    const avatarLocalPath = req.file?.path
    let avatar;
    if(avatarLocalPath){
        avatar = await uploadOnCloudinary(avatarLocalPath)
    }
    let user;
    try{
        user = await User.create({
        username,
        fullname,
        email,
        password,
        avatar: avatar?.url || "https://res.cloudinary.com/ashzenest/image/upload/v1770836588/defaultuser_lnxhcy.jpg"
        })
    }catch(error){
        if(error.name === "ValidationError"){
            throw new ApiError(400, error.message)
        }
        throw new ApiError(500, "Could not create the user")
    }
    
    const createdUser = await User.findById(user._id).select("-refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))
})

export {registerUser}