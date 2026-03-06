import { getValkeyClient } from "../config/valkey.config.js";
import { TimeUnit } from "@valkey/valkey-glide";

const blacklistToken = async(userId, accessToken, remainingTTL) => {
    if(remainingTTL <= 0){
        return
    }
    const valkeyClient = getValkeyClient()
    await valkeyClient.set(`blacklist:${accessToken}`, userId,
        {
            expiry: {type: TimeUnit.Seconds, count: remainingTTL}
        }
    )
}

const isTokenBlacklisted = async(accessToken) => {
    const valkeyClient = getValkeyClient()
    const isBlacklisted = await valkeyClient.get(`blacklist:${accessToken}`)
    return isBlacklisted !== null
}

const cacheSet = async(key, value, remainingTTL) => {
    const valkeyClient = getValkeyClient()

    await valkeyClient.set(key, JSON.stringify(value),
        {
            expiry: {type: TimeUnit.Seconds, count: remainingTTL}
        }
    )
}

const cacheGet = async(key) => {
    const valkeyClient = getValkeyClient()
    const result = await valkeyClient.get(key)
    return result ? JSON.parse(result) : null
}

const cacheDel = async(key) => {
    const valkeyClient = getValkeyClient()
    await valkeyClient.del(key)
}

const invalidateSellerProductsCache = async(sellerId) => {
    const valkeyClient = getValkeyClient()
    let cursor = 0
    const keys = []

    do{
        const result = await valkeyClient.scan(cursor, {match: `products:seller:${sellerId}:page:*`,  count: 100})
        cursor = result.cursor
        keys.push(...result.keys)//there is a reason for this
    } while(cursor !== 0)

    if(keys.length){
        await valkeyClient.del(keys)
    }
}

export {
    blacklistToken,
    isTokenBlacklisted,
    cacheSet,
    cacheGet,
    cacheDel,
    invalidateSellerProductsCache
}