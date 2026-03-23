/**
 * API Call Caching System
 * Improves performance by caching API responses with TTL (Time To Live)
 */

class APICache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Generate cache key from method and URL
   */
  getCacheKey(method, url) {
    return `${method}:${url}`;
  }

  /**
   * Get cached data if exists and not expired
   */
  get(method, url) {
    const key = this.getCacheKey(method, url);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  /**
   * Set cache with TTL in milliseconds (default 5 minutes)
   */
  set(method, url, data, ttl = 5 * 60 * 1000) {
    const key = this.getCacheKey(method, url);

    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store data
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(method, url);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Delete cache entry
   */
  delete(method, url) {
    const key = this.getCacheKey(method, url);
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Invalidate cache by URL pattern
   */
  invalidate(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    this.cache.forEach((value, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      const [method, url] = key.split(":");
      this.delete(method, url);
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache size (for debugging)
   */
  size() {
    return this.cache.size;
  }
}

// Singleton instance
export const apiCache = new APICache();

/**
 * Cache configuration for different endpoints
 * TTL: Time to live in milliseconds
 */
export const CACHE_CONFIG = {
  // Static data - longer cache
  categories: { ttl: 30 * 60 * 1000 }, // 30 minutes
  banners: { ttl: 30 * 60 * 1000 }, // 30 minutes
  events: { ttl: 5 * 60 * 1000 }, // 5 minutes
  eventDetails: { ttl: 5 * 60 * 1000 }, // 5 minutes

  // User data - shorter cache
  userProfile: { ttl: 2 * 60 * 1000 }, // 2 minutes
  tickets: { ttl: 1 * 60 * 1000 }, // 1 minute
  orders: { ttl: 1 * 60 * 1000 }, // 1 minute

  // Search - moderate cache
  search: { ttl: 3 * 60 * 1000 }, // 3 minutes
};

/**
 * Check if request should use cache
 * GET requests are cached, others are not
 */
export const shouldCache = (method) => {
  return method.toUpperCase() === "GET";
};
