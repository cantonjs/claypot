import Koa from 'koa';

export start from './startMonitor';
export startPure from './startPure';
export stop from './stop';
export list from './list';
export log from './log';
export config, { isDev, isProd } from './config';
export cache, { cacheStores } from './dbs/cache';
export models, { getModels, getModelKeys } from './dbs/models';
export schemas, { getSchemas } from './dbs/schemas';
export { Schema, types } from './utils/Schema';
export importModules from './utils/importModules';

export logger, {
setLoggers,
createLogger,
hasLogger,
getLogger,
ensureLogger,
overrideConsole,
resetConsole,
overrideConsoleInRuntime,
} from 'pot-logger';

export function createApp() {
	return new Koa();
}
