const NodeCache = require('node-cache');

// Create cache instances with different TTL
const shortCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const mediumCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const longCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

// Cache middleware factory
const cache = (duration = 'medium') => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query params
    const key = req.originalUrl || req.url;
    
    // Select appropriate cache based on duration
    let cacheInstance;
    switch (duration) {
      case 'short':
        cacheInstance = shortCache;
        break;
      case 'long':
        cacheInstance = longCache;
        break;
      default:
        cacheInstance = mediumCache;
    }

    // Try to get cached response
    const cachedResponse = cacheInstance.get(key);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function(data) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        cacheInstance.set(key, data);
      }
      
      // Call original json method
      originalJson.call(this, data);
    };

    next();
  };
};

// Manual cache operations
const cacheOperations = {
  get: (key, duration = 'medium') => {
    const cacheInstance = duration === 'short' ? shortCache : 
                         duration === 'long' ? longCache : mediumCache;
    return cacheInstance.get(key);
  },
  
  set: (key, value, duration = 'medium') => {
    const cacheInstance = duration === 'short' ? shortCache : 
                         duration === 'long' ? longCache : mediumCache;
    return cacheInstance.set(key, value);
  },
  
  del: (key) => {
    shortCache.del(key);
    mediumCache.del(key);
    longCache.del(key);
  },
  
  flush: () => {
    shortCache.flushAll();
    mediumCache.flushAll();
    longCache.flushAll();
  },
  
  stats: () => ({
    short: shortCache.getStats(),
    medium: mediumCache.getStats(),
    long: longCache.getStats()
  })
};

module.exports = { cache, cacheOperations };
