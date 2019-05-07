import config from '../config';
import { resolve } from 'path';
import { isString } from 'lodash';

export default (app) => {
	const { favicon, baseDir } = config;
	const icon = isString(favicon) ? resolve(baseDir, favicon) : undefined;
	return app.favicon(icon);
};
