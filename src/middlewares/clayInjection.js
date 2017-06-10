
import dbs from '../dbs';
import { getCache } from '../dbs/cache';

export default (app) => app
	.use(async (ctx, next) => {
		const clay = {};

		clay.cache = getCache(); // inject cache
		clay.dbs = dbs; // inject dbs

		ctx.clay = clay;
		await next();
	})
;

