import cacheManager from 'cache-manager';
import { noop, isString } from 'lodash';
import { ensureLogger } from 'pot-logger';
import createProxyObject from '../utils/createProxyObject';
import ms from 'ms';

const logger = ensureLogger('cache', 'magentaBright');
let stores = {};
let cache;
let defaultCacheKey;

export function resolveCacheStore(cacheStoresMap, appConfig) {
	const { dbs } = appConfig;

	stores = {};
	cache = null;
	defaultCacheKey = null;

	Object.keys(dbs).forEach((key) => {
		const db = dbs[key];
		if (db.cache) {
			const { cache: options, ...other } = db;
			const descriptor = {
				...other,
				...options,
			};
			if (isString(descriptor.ttl)) {
				descriptor.ttl = ~~(ms(descriptor.ttl) / 1000);
			}
			if (!defaultCacheKey || options.default) {
				defaultCacheKey = key;
			}
			cacheStoresMap.set(key, descriptor);
		}
	});

	if (!cacheStoresMap.size) {
		const defaultKey = 'default';
		cacheStoresMap.set(defaultKey, {
			store: 'memory',
			max: 100,
			ttl: 60,
		});
		defaultCacheKey = defaultKey;
	}

	return cacheStoresMap;
}

export function createCacheStores(cacheStoresMap) {
	for (const [key, descriptor] of cacheStoresMap) {
		if (!descriptor.store) {
			logger.warn(`"${key}" has NOT "store"`);
			continue;
		}
		const cacheStore = cacheManager.caching(descriptor);
		stores[key] = cacheStore;
		logger.trace(`"${key}" created`);
	}
	cache = stores[defaultCacheKey];
	return { cacheStores: stores, cache };
}

export function getCache() {
	return cache;
}

export function getCacheStores() {
	return stores;
}

export default new Proxy(
	{},
	{
		get(target, key) {
			if (!cache) {
				logger.error('cache is NOT ready');
				return noop;
			}
			return cache[key];
		},
	},
);

export const cacheStores = createProxyObject(() => stores, 'CacheStores');
