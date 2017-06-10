
import cacheManager from 'cache-manager';

let cache;

export function initCache(toBeCache) {
	toBeCache.forEach(({ _key, ...options }) => {
		const cacheStore = cacheManager.caching(options);
		if (!cache) { cache = cacheStore; }
		cache[_key] = cacheStore;
	});
}

export function getCache() {
	return cache;
};
