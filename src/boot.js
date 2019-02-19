import { setLoggers } from 'pot-logger';
import Plugins from './utils/plugins';
import Middlewares from './utils/Middlewares';
import httpProxy from './utils/httpProxy';
import { createApplication } from './application';

export default async function startServer(config) {
	setLoggers(config);
	Plugins.init(config);

	const app = createApplication(config);
	const middlewares = new Middlewares(app);
	const databases = new Map();
	const cacheStoresMap = new Map();
	const modelsMap = new Map();

	await Plugins.parallel('initialize', app);

	Plugins.sync('resolveDatabases', app, databases);
	await Plugins.sequence('willConnectDatabases', databases, app);
	Plugins.sync('didConnectDatabases', databases, app);

	await Plugins.parallel('willResolveSchemas', app);
	Plugins.sync('resolveSchemas', app);
	Plugins.sync('didResolvedSchemas', app.schemas, app);

	Plugins.sync('resolveCacheStore', app, cacheStoresMap);
	await Plugins.sequence('willCreateCacheStores', cacheStoresMap, app);
	Plugins.sync('createCacheStores', app, cacheStoresMap);
	Plugins.sync('didCreateCacheStores', app.cacheStores, app);

	Plugins.sync('resolveModels', app, modelsMap);
	await Plugins.sequence('willCreateModels', modelsMap, app.schemas);
	Plugins.sync('createModels', app, modelsMap, app.schemas);
	Plugins.sync('didCreateModels', app.models, app.schemas, app);

	await Plugins.sequence('initServer', app);
	await Plugins.sequence('willStartServer', app);

	Plugins.sync('proxy', app, httpProxy, config);

	await Plugins.sequence('resolveMiddlewares', app, middlewares);
	await Plugins.sequence('middleware', app, config);
	await Plugins.sequence('willApplyMiddlewares', middlewares.list(), app);
	Plugins.sync('applyMiddlewares', app, middlewares);
	Plugins.sync('didApplyMiddlewares', app);

	await Plugins.sequence('listenToServer', app);
	Plugins.sync('didStartServer', app, databases, cacheStoresMap, modelsMap);

	return app;
}
