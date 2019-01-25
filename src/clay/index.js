import send from 'koa-send';
import { getLogger } from 'pot-logger';
import { getModels } from '../dbs/models';
import { getCache, getCacheStores } from '../dbs/cache';
import serveStatic from './serveStatic';

export function createClay(ctx) {
	const logger = getLogger('server');
	logger.debug('create clay');
	const clay = {};

	clay.cache = getCache(); // inject cache
	clay.cacheStores = getCacheStores(); // inject cacheStores
	clay.models = getModels(); // inject models
	clay.send = (...args) => send(ctx, ...args); // should deprecated

	serveStatic(ctx);

	ctx.clay = clay;
}
