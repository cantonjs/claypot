
import { logger } from '../src';

export default class CustomServer {
	constructor(options) {
		this._options = options;
	}

	middleware(app) {
		app.use(async (ctx, next) => {
			if (ctx.path === '/fork') {
				logger.info('fork');
				ctx.body = 'fork';
			}
			else {
				await next();
			}
		});
	}
}
