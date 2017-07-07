
import { cache, cacheStores, logger } from '../src';

export default class CustomServer {
	constructor(options) {
		this._options = options;
	}

	registerDatabase(register) {
		register('test', {
			createModels(names) {
				return names.reduce((models, name) => {
					models[name] = {
						getData() {
							return name;
						}
					};
					return models;
				}, {});
			}
		});
	}

	middleware(app) {
		app.use(async (ctx, next) => {
			if (ctx.path === '/fork') {
				logger.info('typeof cache', typeof cache);
				logger.info('typeof cacheStores.memory', typeof cacheStores.memory);
				ctx.body = ctx.clay.models.Hello.say();
			}
			else {
				await next();
			}
		});
	}
}
