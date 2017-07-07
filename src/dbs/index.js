
import { initCache } from '../cache';
import { initModels } from '../models';
import { applyRegisterDatabase } from '../utils/plugins';
import { appLogger } from '../utils/logger';
import { isFunction } from 'lodash';

const dbs = {};
const cacheCreators = [];
const modelCreators = [];

const register = function register(key, config = {}) {
	dbs[key] = config;
};

export default async function init(appConfig) {
	const { dbs: dbsConfig } = appConfig;

	await applyRegisterDatabase(register);

	Object.keys(dbsConfig).forEach((key) => {

		const {
			store,
			models = {},
			cache,
			...options,
		} = dbsConfig[key];

		if (!store) {
			appLogger.error(`Database "${key}" requires "${store}" field.`);
			return;
		}

		const db = dbs[store];

		if (!db) {
			appLogger.warn(`"${store}" is NOT a valid db.`);
			return;
		}

		const { connect, createCache, createModels } = db;

		isFunction(connect) && connect(options);

		if (cache) {
			if (!isFunction(createCache)) {
				appLogger.warn(`"${store}" does NOT support cache.`);
			}
			else {
				const { isDefault, ...other } = cache;
				const method = isDefault ? 'unshift' : 'push';
				cacheCreators[method]({
					key,
					createCache,
					options: { ...options, ...other },
				});
			}
		}

		if (isFunction(createModels)) {
			modelCreators.push({
				key,
				createModels,
				options: models,
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
