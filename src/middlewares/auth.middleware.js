import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    const log = req.log.child({
        module: "auth",
        operation: "verifyJWT"
    })
    log.info("Token verification started")

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (err) {
        throw new ApiError(401, err.message || "Invalid access token")
    }

    const user = await User.findById(decodedToken._id).select("-refreshToken")
    if(!user){
        throw new ApiError(401, "Invalid access token")
    }
    if(user.status !== "active"){
        throw new ApiError(401, `User is ${user.status}`)
    }
    req.user = user
    req.token = token
    req.decodedToken = decodedToken
    log.info("Token verification successful")
    next()
})

const authorizeRoles = (...roles) => {
    return asyncHandler(async(req, _, next) => {
        const log = req.log.child({
            module: "auth",
            operation: "authorizeRoles",
            userId: req.user._id
        })
        log.info("Authorize user's role started") 
        if(!roles.includes(req.user.role)){
            throw new ApiError(403, "Forbidden")
        }
        log.info("User authorized successfully")
        next()
    })
}

export {
    verifyJWT,
    authorizeRoles
}