
import cacheManager from 'cache-manager';
import { isObject, noop } from 'lodash';
import { appLogger } from './utils/logger';
import createProxyObject from './utils/createProxyObject';

const extendJsonMethods = (cacheStore) => {
	cacheStore.getJson = async (key) => {
		const str = await cacheStore.get(key);
		return str ? JSON.parse(str) : null;
	};
	cacheStore.setJson = async (key, value, ...args) => {
		if (isObject(value)) { value = JSON.stringify(value); }
		return cacheStore.set(key, value, ...args);
	};
	cacheStore.wrapJson = async (key, work, ...args) => {
		const jsonWork = async () => {
			let value = await work();
			if (isObject(value)) { value = JSON.stringify(value); }
			return value;
		};
		const str = await cacheStore.wrap(key, jsonWork, ...args);
		return str ? JSON.parse(str) : null;
	};
	return cacheStore;
};

const stores = {};
let cache;

export function initCache(creators) {
	creators.forEach(({ key, createCache, options }, index) => {
		const creater = createCache(options);
		const cacheStore = extendJsonMethods(cacheManager.caching(creater));
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
