
import fav from 'koa-favicon';
import config from '../config';
import { resolve } from 'path';

const defaults = '../../assets/favicon.ico';

export default (app) => {
	const { favicon, root } = config;
	const icon = favicon ? resolve(root, favicon) : resolve(__dirname, defaults);
	return app.use(fav(icon));
};
