import { getLogger } from 'pot-logger';
import claypotConfig from '../config';
import { resolve } from 'path';

export default function serve(app, options) {
	const { baseDir } = claypotConfig;
	const logger = getLogger('server');

	if (!Array.isArray(options)) options = [options];

	options.forEach((option = {}) => {
		const { dir, root } = option;
		if (root || dir) {
			const staticDir = root || resolve(baseDir, dir);
			logger.debug('static directory', staticDir);
			if (!root) option.root = staticDir;
		}
	});

	app.use(async function serveStatic(ctx, next) {
		for (const option of options) {
			const done = await ctx.serveStatic(option);
			if (done) return;
		}
		await next();
	});
}
