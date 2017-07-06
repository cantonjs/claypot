
import dbs from '../dbs';
import { getModels } from '../models';
import { getCache } from '../cache';

export default (app) => app
	.use(async (ctx, next) => {
		const clay = {};

		clay.dbs = dbs; // inject dbs
		clay.cache = getCache(); // inject cache
		clay.models = getModels(); // inject models

		ctx.clay = clay;
		await next();
	})
;
