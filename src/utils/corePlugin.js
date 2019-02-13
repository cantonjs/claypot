import { logger } from 'pot-logger';
import { resolveDatabases } from '../dbs';
import { resolveSchemas } from '../dbs/schemas';
import { resolveCacheStore, createCacheStores } from '../dbs/cache';
import { resolveModels, createModels } from '../dbs/models';
import { name, version } from '../../package.json';
import http from 'http';
import https from 'https';
import getCertOption from '../utils/getCertOption';
import { listenToServer, closeServer } from '../utils/listenToServer';

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
		const { host, port, baseDir, ssl } = this._config;

		const servers = [http.createServer(app.callback())];
		const listens = [listenToServer(servers[0], port, host)];

		if (ssl && ssl.enable !== false) {
			const { port: httpsPort, key, cert } = ssl;
			const options = getCertOption(baseDir, key, cert);
			const httpsServer = https.createServer(options, app.callback());
			servers.push(httpsServer);
			listens.push(listenToServer(httpsServer, httpsPort, host));
		}

		app.close = () => Promise.all(servers.map(closeServer));

		await Promise.all(listens);
	}

	didStartServer(app, databases, cacheStoresMap, modelsMap) {
		databases.clear();
		cacheStoresMap.clear();
		modelsMap.clear();
	}
}
