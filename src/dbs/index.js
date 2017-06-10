
import { initCache } from './cache';
import { getByStore } from './register';
import { appLogger } from '../utils/logger';

const dbs = {};

export function initDbs(dbsConfig) {
	const toBeCache = [];

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

export default dbs;
