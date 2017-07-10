
import cacheManager from 'cache-manager';
import { noop } from 'lodash';
import { appLogger } from './utils/logger';
import createProxyObject from './utils/createProxyObject';

const stores = {};
let cache;

export function initCache(creators) {
	creators.forEach(({ key, createCache, options }, index) => {
		const creater = createCache(options);
		const cacheStore = cacheManager.caching(creater);
		if (!index) { cache = cacheStore; }
		stores[key] = cacheStore;
	});
}

export function getCache() {
	return cache;
};

export function getCacheStores() {
	return stores;
}

export default new Proxy({}, {
	get(target, key) {
		if (!cache) {
			appLogger.error('Cache is NOT ready');
			return noop;
		}
		return cache[key];
	}
});

export const cacheStores = createProxyObject(stores, 'CacheStores');
