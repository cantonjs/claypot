
import dbs from './index';
import { initCache } from '../cache';
import { applyConnectDB } from '../utils/plugins';
import { appLogger } from '../utils/logger';
import * as memory from './memory';

const dbsPlugins = { memory };

const register = function register(key, connect, cacheStore) {
	dbsPlugins[key] = { connect, cacheStore };
};

const getByStore = function getByStore(store) {
	return dbsPlugins[store];
};

export default async function init(dbsConfig) {
	const toBeCache = [];

	await applyConnectDB(register);

	Object.keys(dbsConfig).forEach((key) => {

		const { cache, ...options } = dbsConfig[key];

		if (!options.store) { options.store = 'memory'; }

		const dbStore = getByStore(options.store);

		if (!dbStore) {
			appLogger.warn(`"${options.store}" is NOT a valid db.`);
			return;
		}

		const { connect, cacheStore } = dbStore;
		dbs[key] = connect(options);

		if (cache) {
			if (!cacheStore) {
				appLogger.warn(`"${options.store}" does NOT support cache.`);
				return;
			}

			toBeCache.unshift({
				_key: key,
				...options,
				...cache,
				store: cacheStore,
			});
		}
	});

	// ensure one cache store at least.
	if (!toBeCache.length) {
		toBeCache.push({
			_key: '__default',
			store: 'memory',
			max: 100,
			ttl: 60,
		});
	}

	initCache(toBeCache);

	return dbs;
}
