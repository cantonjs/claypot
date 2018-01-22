import Koa from 'koa';

export start from './start';
export stop from './stop';
export list from './list';
export log from './log';
export logger, {
setLoggers,
createLogger,
hasLogger,
getLogger,
overrideConsole,
resetConsole,
overrideConsoleInRuntime,
} from 'pot-logger';
export config, { isDev, isProd } from './config';
export cache, { cacheStores } from './dbs/cache';
export models, { getModels, getModelKeys } from './dbs/models';

export function createApp() {
	return new Koa();
}
