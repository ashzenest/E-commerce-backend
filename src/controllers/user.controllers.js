import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//ONLY ACCEPT STRING AS INPUT

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    }).select("+password")

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400, "Incorrect password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {}, "Login successfull"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken
    if(!token){
        throw new ApiError(401, "Invalid refresh token")
    }
    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
    const user = await User.findById(decodedToken._id)
    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }

    if(user.refreshToken !== token){
        throw new ApiError(401, "Refresh token has been revoked or is invalid")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(decodedToken._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {}, "Refresh access token successfull"))
})

export {
    registerUser,
    loginUser,
    refreshAccessToken
}