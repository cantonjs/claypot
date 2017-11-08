import { initCache } from './cache';
import { initModels } from './models';
import Plugins from '../utils/plugins';
import { createLogger } from 'pot-logger';
import { isFunction } from 'lodash';

const logger = createLogger('dbs', 'red');
const dbs = {};
const cacheCreators = [];
const modelCreators = [];

const register = function register(storeKey, config = {}) {
	dbs[storeKey] = config;
};

export default async function init(appConfig) {
	const { dbs: dbsConfig } = appConfig;

	await Plugins.parallel('registerDatabase', register);

	Object.keys(dbsConfig).forEach((dbKey) => {

		const {
			store,
			models = {},
			cache,
			...options,
		} = dbsConfig[dbKey];

		if (!store) {
			logger.error(`database "${dbKey}" requires "${store}" field`);
			return;
		}

		const db = dbs[store];

		if (!db) {
			logger.warn(`"${store}" is NOT a valid db`);
			return;
		}

		const { connect, createCache, createModels } = db;

		if (isFunction(connect)) {
			try {
				connect(options);
				logger.trace(`"${store}" connected`);
			}
			catch (err) {
				logger.error(`connect "${store}" failed.`, err);
			}
		}

		if (cache) {
			if (!isFunction(createCache)) {
				logger.warn(`"${store}" does NOT support cache`);
			}
			else {
				const { isDefault, ...other } = cache;
				const method = isDefault ? 'unshift' : 'push';
				cacheCreators[method]({
					dbKey,
					createCache,
					options: { ...options, ...other },
				});
			}
		}

		if (isFunction(createModels)) {
			modelCreators.push({
				dbKey,
				createModels,
				options: { ...options, ...models },
			});
		}
	});

	// ensure one cache store at least.
	if (!cacheCreators.length) {
		cacheCreators.push({
			key: 'memory',
			createCache: (options) => options,
			options: {
				store: 'memory',
				max: 100,
				ttl: 60,
			},
		});
	}

	initCache(cacheCreators);
	initModels(modelCreators, appConfig);

	return dbs;
}
