
import cacheManager from 'cache-manager';
import { noop } from 'lodash';
import { createLogger } from 'pot-logger';
import createProxyObject from './utils/createProxyObject';

const logger = createLogger('cache', 'magentaBright');
const stores = {};
let cache;

export function initCache(creators) {
	creators.forEach(({ key, createCache, options }, index) => {
		const creater = createCache(options);
		const cacheStore = cacheManager.caching(creater);
		if (!index) { cache = cacheStore; }
		stores[key] = cacheStore;
		logger.trace(`created cache "${key}"`);
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
			logger.error('Cache is NOT ready');
			return noop;
		}
		return cache[key];
	}
});

export const cacheStores = createProxyObject(stores, 'CacheStores');
