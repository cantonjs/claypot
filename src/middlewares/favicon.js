
import fav from 'koa-favicon';
import config from '../config';
import { resolve } from 'path';
import { isString } from 'lodash';

const defaults = '../../assets/favicon.ico';

export default (app) => {
	const { favicon, root } = config;
	const icon = isString(favicon) ?
		resolve(root, favicon) : resolve(__dirname, defaults)
	;
	return app.use(fav(icon));
};
