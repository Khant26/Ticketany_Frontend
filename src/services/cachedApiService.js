/**
 * Optimized API Service with Caching
 * Wraps existing apiService with caching layer
 */

import { apiCache, CACHE_CONFIG, shouldCache } from "../utils/apiCache";
import ApiService from "./apiService";

class CachedApiService extends ApiService {
  /**
   * Make API request with caching support
   */
  async apiRequest(endpoint, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const cacheKey = `${method}:${endpoint}`;

    // Check cache for GET requests
    if (shouldCache(method)) {
      const cached = apiCache.get(method, endpoint);
      if (cached) {
        console.log(`[Cache Hit] ${cacheKey}`);
        return { success: true, data: cached.data, fromCache: true };
      }
    }

    // Make actual request
    const result = await super.apiRequest(endpoint, options);

    // Cache successful GET responses
    if (shouldCache(method) && result.success) {
      const cacheTtl = this.getCacheTTL(endpoint);
      apiCache.set(method, endpoint, result.data, cacheTtl);
      console.log(`[Cache Set] ${cacheKey} (TTL: ${cacheTtl}ms)`);
    }

    return result;
  }

  /**
   * Determine TTL based on endpoint pattern
   */
  getCacheTTL(endpoint) {
    if (endpoint.includes("categories")) return CACHE_CONFIG.categories.ttl;
    if (endpoint.includes("banners")) return CACHE_CONFIG.banners.ttl;
    if (endpoint.includes("events") && !endpoint.includes("/events/")) {
      return CACHE_CONFIG.eventDetails.ttl;
    }
    if (endpoint.includes("events")) return CACHE_CONFIG.events.ttl;
    if (endpoint.includes("profile")) return CACHE_CONFIG.userProfile.ttl;
    if (endpoint.includes("tickets")) return CACHE_CONFIG.tickets.ttl;
    if (endpoint.includes("orders")) return CACHE_CONFIG.orders.ttl;
    if (endpoint.includes("search")) return CACHE_CONFIG.search.ttl;

    return 5 * 60 * 1000; // Default 5 minutes
  }

  /**
   * Invalidate cache for specific data type
   */
  invalidateCache(pattern) {
    apiCache.invalidate(pattern);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    apiCache.clear();
  }
}

// Export singleton instance
export default new CachedApiService();

// Also export cache utilities for manual cache management
export { apiCache, CACHE_CONFIG };
