
import { getModels } from '../models';
import { getCache, getCacheStores } from '../cache';

export default (app) => app
	.use(async (ctx, next) => {
		const clay = {};

		clay.cache = getCache(); // inject cache
		clay.cacheStores = getCacheStores(); // inject cacheStores
		clay.models = getModels(); // inject models

		ctx.clay = clay;
		await next();
	})
;
