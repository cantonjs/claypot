import http from 'http';
import https from 'https';
import Koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { setLoggers, logger } from 'pot-logger';
import mount from 'koa-mount';
import Plugins from './utils/plugins';
import getCertOption from './utils/getCertOption';
import { listenToServer, closeServer } from './utils/listenToServer';
import { resolveDatabases } from './dbs';
import { resolveCacheStore, createCacheStores } from './dbs/cache';
import { resolveModels, createModels } from './dbs/models';
import { name, version } from '../package.json';

export default async function startServer(config) {
	const { host, port, baseDir, ssl, production } = config;

	setLoggers(config);

	logger.debug(`${name} version: v${version}`);
	logger.trace('production:', production);

	Plugins.init(config);

	const app = new Koa();

	await Plugins.sequence('bootstrap', app);

	const dbsMap = resolveDatabases(config);
	await Plugins.sequence('dbs', dbsMap, app);
	dbsMap.clear();

	const cacheStoresMap = resolveCacheStore(config);
	await Plugins.sequence('cacheStores', cacheStoresMap, app);
	const { cacheStores, cache } = createCacheStores(cacheStoresMap);
	app.cache = cache;
	app.cacheStores = cacheStores;
	cacheStoresMap.clear();

	const modelsMap = resolveModels(config);
	await Plugins.sequence('models', modelsMap);
	const models = createModels(modelsMap, app);
	app.models = models;
	modelsMap.clear();

	app.mount = (...args) => app.use(mount(...args));
	app.close = () => Promise.all(servers.map(closeServer));

	await Plugins.sequence('initServer', app);

	useMiddlewares(app);

	Plugins.sync('serverWillStart', app);

	const servers = [http.createServer(app.callback())];
	const listens = [listenToServer(servers[0], port, host)];

	if (ssl && ssl.enable !== false) {
		const { port: httpsPort, key, cert } = ssl;
		const options = getCertOption(baseDir, key, cert);
		const httpsServer = https.createServer(options, app.callback());
		servers.push(httpsServer);
		listens.push(listenToServer(httpsServer, httpsPort, host));
	}

	await Promise.all(listens);
	Plugins.sync('serverDidStart', app);

	return app;
}
