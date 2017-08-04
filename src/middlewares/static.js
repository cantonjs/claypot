
import koaStatic from 'koa-static';
import config, { isProd } from '../config';
import { isString } from 'lodash';
import { resolve } from 'path';

const maxAge = 31536000000; // 365 * 24 * 60 * 60 * 1000

export default function serveStatic(app, options) {
	if (isString(options)) {
		options = { dir: options };
	}

	const { dir, ...other } = options;
	return app.use(koaStatic(resolve(config.baseDir, dir), {
		maxAge: isProd ? maxAge : 0,
		gzip: isProd,
		...other,
	}));
};
