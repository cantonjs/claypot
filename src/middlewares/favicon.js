import fav from 'koa-favicon';
import config from '../config';
import { resolve } from 'path';
import { isString } from 'lodash';

const defaults = '../../assets/favicon.ico';

export default (app) => {
	const { favicon, baseDir } = config;
	const icon = isString(favicon) ?
		resolve(baseDir, favicon) :
		resolve(__dirname, defaults);
	const faviconFn = fav(icon);
	faviconFn.keyName = 'favicon';
	return app.use(faviconFn);
};
