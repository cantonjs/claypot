
import cacheManager from 'cache-manager';
import { isObject } from 'lodash';

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

let cache;

export function initCache(toBeCache) {
	toBeCache.forEach(({ _key, ...options }) => {
		const cacheStore = extendJsonMethods(cacheManager.caching(options));
		if (!cache) { cache = cacheStore; }
		cache[_key] = cacheStore;
	});
}

export function getCache() {
	return cache;
};

export default new Proxy({}, {
	get(target, key) {
		if (!cache) { throw new Error('Please run `initCache` before get cache'); }
		return cache[key];
	}
});
