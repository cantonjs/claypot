import { ensureLogger } from '../src';

export default class CustomServer {
	constructor(options) {
		this._options = options;
	}

	middleware(app) {
		const forkLogger = ensureLogger('fork');
		app.get('/fork', async (ctx) => {
			const body = 'fork you';
			forkLogger.info(body);
			Object.assign(ctx, { body });
		});
	}
}
