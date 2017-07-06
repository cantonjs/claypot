
import { logger } from '../src';

export default class CustomServer {
	constructor(options) {
		this._options = options;
	}

	connectDB(register) {
		register('tmp', () => {});
	}

	registerModels(register, names) {
		register('tmp', names.reduce((models, name) => {
			models[name] = {
				log() {
					logger.info('log', name);
				}
			};
			return models;
		}, {}));
	}

	middleware(app) {
		app.use(async (ctx, next) => {
			if (ctx.path === '/fork') {
				ctx.clay.models.Fork.test();
				ctx.body = 'fork';
			}
			else {
				await next();
			}
		});
	}
}
