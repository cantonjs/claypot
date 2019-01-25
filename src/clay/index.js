import send from 'koa-send';
import { getLogger } from 'pot-logger';
import { getModels } from '../dbs/models';
import { getCache, getCacheStores } from '../dbs/cache';
import serveStatic from './serveStatic';

export function createClay(ctx) {
	const logger = getLogger('server');
	const clay = {};

	logger.trace('inject clay.cache');
	clay.cache = getCache();

	logger.trace('inject clay.cacheStores');
	clay.cacheStores = getCacheStores();

	logger.trace('inject clay.models');
	clay.models = getModels();

	clay.send = (...args) => send(ctx, ...args);

	logger.trace('inject clay.serveStatic');
	serveStatic(ctx);

	ctx.clay = clay;
}
