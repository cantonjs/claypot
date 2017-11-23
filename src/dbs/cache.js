
import cacheManager from 'cache-manager';
import { noop, isString } from 'lodash';
import { createLogger } from 'pot-logger';
import createProxyObject from '../utils/createProxyObject';
import ms from 'ms';

const logger = createLogger('cache', 'magentaBright');
const stores = {};
let cache;

export function initCache(creators) {
	creators.forEach(({ dbKey, createCache, options }, index) => {
		if (options && isString(options.ttl)) {
			options.ttl = ~~(ms(options.ttl) / 1000);
		}
		const creater = createCache(options);
		const cacheStore = cacheManager.caching(creater);
		if (!index) { cache = cacheStore; }
		stores[dbKey] = cacheStore;
		logger.trace(`"${dbKey}" created`);
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
			logger.error('cache is NOT ready');
			return noop;
		}
		return cache[key];
	}
});

export const cacheStores = createProxyObject(stores, 'CacheStores');
