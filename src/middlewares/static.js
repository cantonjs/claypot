
import koaStatic from 'koa-static';
import config from '../config';

const maxAge = 31536000000; // 365 * 24 * 60 * 60 * 1000

export default (app, options = {}) =>
	app.use(koaStatic(config.staticDir, {
		maxAge,
		...options,
	}))
;
