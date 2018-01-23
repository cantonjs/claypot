import cacheManager from 'cache-manager';
import { noop, isString } from 'lodash';
import { createLogger } from 'pot-logger';
import createProxyObject from '../utils/createProxyObject';
import ms from 'ms';

const logger = createLogger('cache', 'magentaBright');
const cacheStores = {};
let cache;

let defaultCacheKey = null;

export function resolveCacheStore(appConfig) {
	const { dbs } = appConfig;
	const cacheStoresMap = new Map();

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
		const cacheStore = cacheManager.caching(descriptor);
		cacheStores[key] = cacheStore;
		logger.trace(`"${key}" created`);
	}
	cache = cacheStores[defaultCacheKey];
	return { cacheStores, cache };
}

export function getCache() {
	return cache;
}

export function getCacheStores() {
	return cacheStores;
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

export const CacheStores = createProxyObject(cacheStores, 'CacheStores');
