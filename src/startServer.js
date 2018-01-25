import http from 'http';
import https from 'https';
import Koa from 'koa';
import { setLoggers, logger } from 'pot-logger';
import Plugins from './utils/plugins';
import getCertOption from './utils/getCertOption';
import { listenToServer, closeServer } from './utils/listenToServer';
import { resolveDatabases } from './dbs';
import { resolveCacheStore, createCacheStores } from './dbs/cache';
import { resolveModels, createModels } from './dbs/models';
import { resolveSchemas, createSchemas } from './dbs/schemas';
import MiddlewareManager from './utils/MiddlewareManager';
import { name, version } from '../package.json';

export default async function startServer(config) {
	const { host, port, baseDir, ssl, production } = config;

	setLoggers(config);

	logger.debug(`${name} version: v${version}`);
	logger.trace('production:', production);

	Plugins.init(config);

	const app = new Koa();

	await Plugins.parallel('initialize', app);

	const dbsMap = resolveDatabases(config);
	await Plugins.sequence('willConnectDatabases', dbsMap, app);
	Plugins.sync('didConnectDatabases', dbsMap, app);
	dbsMap.clear();

	const schemasMap = resolveSchemas(config);
	await Plugins.sequence('willCreateSchemas', schemasMap, app);
	const schemas = createSchemas(schemasMap);
	app.schemas = schemas;
	Plugins.sync('didCreateSchemas', schemas, app);
	schemasMap.clear();

	const cacheStoresMap = resolveCacheStore(config);
	await Plugins.sequence('willCreateCacheStores', cacheStoresMap, app);
	const { cacheStores, cache } = createCacheStores(cacheStoresMap);
	app.cache = cache;
	app.cacheStores = cacheStores;
	Plugins.sync('didCreateCacheStores', cacheStoresMap, app);
	cacheStoresMap.clear();

	const modelsMap = resolveModels(config);
	await Plugins.sequence('willCreateModels', modelsMap, schemas);
	const models = createModels(modelsMap, app);
	app.models = models;
	Plugins.sync('didCreateModels', modelsMap, schemas, app);
	modelsMap.clear();

	const mManager = new MiddlewareManager(app);

	await Plugins.sequence('initServer', app);
	await Plugins.sequence('willStartServer', app);

	mManager.resolve();
	await Plugins.sequence('willApplyMiddlewares', mManager.middlewares(), app);
	mManager.apply();
	Plugins.sync('didApplyMiddlewares', app);

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
	Plugins.sync('didStartServer', app);

	return app;
}
