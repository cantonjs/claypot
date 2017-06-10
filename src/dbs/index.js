
import { initCache } from './cache';
import * as memory from './memory';
import { appLogger } from '../utils/logger';

const dbs = {};
const dbsPlugins = { memory };

export function registerDBPlugin(key, connect, cacheStore) {
	dbsPlugins[key] = { connect, cacheStore };
}

export function initDbs(config) {
	const toBeCache = [];

	Object.keys(config).forEach((key) => {

		const { cache, ...options } = config[key];

		if (!options.store) { options.store = 'memory'; }

		if (!dbsPlugins.hasOwnProperty(options.store)) {
			appLogger.warn(`"${options.store}" is NOT a valid db.`);
			return;
		}

		const { connect, cacheStore } = dbsPlugins[options.store];
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

export default dbs;
