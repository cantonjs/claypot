import { createLogger } from '../src';

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
						},
					};
					return models;
				}, {});
			},
		});
	}

	middleware(app) {
		const forkLogger = createLogger('fork');
		app.use(async (ctx, next) => {
			if (ctx.path === '/fork') {
				forkLogger.info('fork you');
				ctx.body = ctx.clay.models.Hello.say();
			}
			else {
				await next();
			}
		});
	}
}
