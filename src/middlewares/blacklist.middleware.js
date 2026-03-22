import { isTokenBlacklisted } from "../services/valkey.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const blacklistCheck = asyncHandler(async (req, _, next) => {
    const log = req.log.child({
        module: "blacklist",
        operation: "blacklistCheck",
        userId: req.user._id
    })
    log.info("Check blacklist started")
    const isBlacklisted = await isTokenBlacklisted(req.token)
    if(isBlacklisted){
        throw new ApiError(401, "Token revoked")
    }
    log.info("Blacklist checked successfully")
    next()
})

export {blacklistCheck}