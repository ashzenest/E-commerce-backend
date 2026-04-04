import { cacheHitOrMissesTotal } from "../config/metrics.config.js";
import { getValkeyClient } from "../config/valkey.config.js";
import { TimeUnit } from "@valkey/valkey-glide";
import crypto from "crypto";

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

const cacheGet = async(key, model) => {
    const valkeyClient = getValkeyClient()
    const result = await valkeyClient.get(key)
    cacheHitOrMissesTotal.inc({model, result: result ?  "hit" : "miss"})
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

const acquireValkeyLock = async(lockKey, lockValue, remainingTTL) => {
    const valkeyClient = getValkeyClient()
    const lockAcquired = await valkeyClient.set(lockKey, lockValue,
    {
        expiry: {type: TimeUnit.Seconds, count: remainingTTL},
        conditionalSet: "onlyIfDoesNotExist"
    })
    return lockAcquired !== null
}

const releaseValkeyLock = async(lockKey, lockValue) => {
    const valkeyClient = getValkeyClient()
    const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    `
    await valkeyClient.eval(luaScript, [lockKey], [lockValue])
}

const getWithLock = async(cacheKey, ttl, model, dbQuery) => {
    const cached = await cacheGet(cacheKey, model)
    if(cached){
        return cached
    }

    const lockKey = `lock:${cacheKey}`
    const lockValue = crypto.randomUUID()
    const lockAcquired = await acquireValkeyLock(lockKey, lockValue, 200)
    if(!lockAcquired){
        await new Promise((resolve) => setTimeout(resolve, 200))
        const cached = await cacheGet(cacheKey, model)
        if(cached){
            return cached
        }
        const result = await dbQuery()
        return result
    }
    
    try {
        const result = await dbQuery()
        await cacheSet(cacheKey, result, ttl)
        return result
    } finally {
        await releaseValkeyLock(lockKey, lockValue)
    }
}

export {
    blacklistToken,
    isTokenBlacklisted,
    cacheDel,
    invalidateSellerProductsCache,
    getWithLock
}