
import staticCache from 'koa-static-cache';
import { staticDir } from '../utils/getConfig';

const maxAge = 31536000000; // 365 * 24 * 60 * 60 * 1000

export default (app, options = { maxAge }) =>
	app.use(staticCache(staticDir, options))
;
