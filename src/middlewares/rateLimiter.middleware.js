import { RateLimiterValkeyGlide } from "rate-limiter-flexible";
import { getValkeyClient } from "../config/valkey.config.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

let loginIpLimiter = null
let loginUserLimiter = null
let registerIpLimiter = null
let forgotPasswordUserLimiter = null
let emailChangeUserLimiter = null

const getLimiter = (keyPrefix, points, durationInMin) => {
    return new RateLimiterValkeyGlide({
        storeClient: getValkeyClient(),
        keyPrefix,
        points,
        duration: 60 * durationInMin
    })
}

const getLoginIpLimiter = () => {
    if(!loginIpLimiter){
        loginIpLimiter = getLimiter("login_ip", 10, 10)
    }
    return loginIpLimiter
}

const getLoginUserLimiter = () => {
    if(!loginUserLimiter){
        loginUserLimiter = getLimiter("login_user", 5, 10)
    }
    return loginUserLimiter
}

const getRegisterIpLimiter = () => {
    if(!registerIpLimiter){
        registerIpLimiter = getLimiter("register_user", 10, 15)
    }
    return registerIpLimiter
}

const getForgotPasswordUserLimiter = () => {
    if(!forgotPasswordUserLimiter){
        forgotPasswordUserLimiter = getLimiter("forgetPassword_user", 1, 60)
    }
    return forgotPasswordUserLimiter
}

const getEmailChangeUserLimiter = () => {
    if(!emailChangeUserLimiter){
        emailChangeUserLimiter = getLimiter("emailChange_user", 1, 24 * 60)
    }
    return emailChangeUserLimiter
}

const loginIpRateLimiter = asyncHandler(async (req, _, next) => {
    try {
        await getLoginIpLimiter().consume(req.ip)
        next()
    } catch (error) {
        throw new ApiError(429, "Too many requests")
    }
})

const registerIpRateLimiter = asyncHandler(async (req, _, next)  => {
    try {
        await getRegisterIpLimiter().consume(req.ip)
        next()
    } catch (error) {
        throw new ApiError(429, "Too many requests")
    }
})

//NOT ACTUAL MIDDLEWARE BUT STILL RATELIMITERS

const loginUserRateLimiter = async(userId)  => {
    try {
        await getLoginUserLimiter().consume(userId)
    } catch (error) {
        throw new ApiError(429, "Too many requests")
    }
}

const forgotPasswordUserRateLimiter = async(userId) => {
    try {
        await getForgotPasswordUserLimiter().consume(userId)
    } catch (error) {
        throw new ApiError(429, "Too many requests")
    }
}

const emailChangeUserRateLimiter = async(userId) => {
    try {
        await getEmailChangeUserLimiter().consume(userId)
    } catch (error) {
        throw new ApiError(429, "Too many requests")
    }
}

export {
    loginIpRateLimiter,
    registerIpRateLimiter,
    loginUserRateLimiter,
    forgotPasswordUserRateLimiter,
    emailChangeUserRateLimiter
}