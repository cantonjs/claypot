
import config from '../config';
import importModule from 'pot-js/lib/utils/importModule';
import { resolve } from 'path';
import { isObject, isString } from 'lodash';
import { appLogger } from './logger';

export default (app) => {
	config
		.middlewares
		.map((middleware) => {
			if (isString(middleware)) {
				return { module: middleware };
			}
			else if (isObject(middleware)) {
				return middleware;
			}
			else {
				throw `Middleware ${middleware} is INVALID.`;
			}
		})
		.filter(({ enable = true }) => enable)
		.forEach(({ module, options = {} }) => {
			try {
				const use = importModule(module, {
					...config,
					prefer: resolve(__dirname, '../middlewares'),
				});
				use(app, options);
			}
			catch (err) {
				appLogger.error(err);
			}
		})
	;
};
