import { getModels } from '../dbs/models';
import { getCache, getCacheStores } from '../dbs/cache';

export default (app) =>
	app.use(async function claypotInjection(ctx, next) {
		const clay = {};

		clay.cache = getCache(); // inject cache
		clay.cacheStores = getCacheStores(); // inject cacheStores
		clay.models = getModels(); // inject models

		ctx.clay = clay;
		await next();
	});
