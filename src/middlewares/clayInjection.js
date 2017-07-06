
import dbs from '../dbs';
import models from '../models';
import { getCache } from '../dbs/cache';

export default (app) => app
	.use(async (ctx, next) => {
		const clay = {};

		clay.cache = getCache(); // inject cache
		clay.dbs = dbs; // inject dbs
		clay.models = models; // inject models

		ctx.clay = clay;
		await next();
	})
;
