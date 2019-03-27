import { logger } from 'pot-logger';
import { resolveDatabases } from '../dbs';
import { resolveSchemas } from '../dbs/schemas';
import { resolveCacheStore, createCacheStores } from '../dbs/cache';
import { resolveModels, createModels } from '../dbs/models';
import { name, version } from '../../package.json';

export default class Boot {
	constructor(config) {
		this._config = config;
	}

	initialize() {
		const { production } = this._config;
		logger.debug(`${name} version: v${version}`);
		logger.trace('production:', production);
	}

	resolveDatabases(app, databases) {
		resolveDatabases(databases, this._config);
	}

	resolveSchemas(app) {
		const schemas = resolveSchemas(this._config.schemas);
		app.schemas = schemas;
	}

	resolveCacheStore(app, cacheStoresMap) {
		resolveCacheStore(cacheStoresMap, this._config);
	}

	createCacheStores(app, cacheStoresMap) {
		const { cacheStores, cache } = createCacheStores(cacheStoresMap);
		app.cache = cache;
		app.cacheStores = cacheStores;
	}

	resolveModels(app, modelsMap) {
		resolveModels(modelsMap, this._config.models);
	}

	createModels(app, modelsMap) {
		const models = createModels(modelsMap, app);
		app.models = models;
	}

	async resolveMiddlewares(app, middlewares) {
		await middlewares.resolve();
	}

	applyMiddlewares(app, middlewares) {
		middlewares.apply();
	}

	async listenToServer(app) {
		const { host, port, ssl } = this._config;

		const options = [{ host, port }];
		if (ssl && ssl.enable) {
			const { key, cert, ...tlsOption } = ssl;
			tlsOption.tls = { key, cert };
			options.push(tlsOption);
		}

		return app.serve(...options);
	}

	didStartServer(app, databases, cacheStoresMap, modelsMap) {
		databases.clear();
		cacheStoresMap.clear();
		modelsMap.clear();
	}
}
