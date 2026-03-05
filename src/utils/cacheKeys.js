const CacheKeys = {
    userProfile: (id) => `user:profile:${id}`,
    category: (id) => `categories:id:${id}`,
    allCategory: () => `categories:all`, 
    product: (id) => `products:id:${id}`,
    productsBySellers: (sellerId, page) => `products:seller:${sellerId}:page:${page}`
}

export {CacheKeys}