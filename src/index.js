
import Koa from 'koa';

export start from './start';
export stop from './stop';
export list from './list';
export log from './log';
export logger, { initLog } from './utils/logger';
export config, { isDev, isProd } from './config';
export connectDbs from './dbs/connect';
export cache from './dbs/cache';

export function createApp() {
	return new Koa();
}
