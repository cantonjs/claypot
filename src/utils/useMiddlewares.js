
import config from '../config';
import { resolveMiddleware } from './resolve';
import { isObject, isString, isFunction } from 'lodash';
import { appLogger } from './logger';

export default (app) => {
	config
		.middlewares
		.map((middleware) => {
			if (isString(middleware) || isFunction(middleware)) {
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
				const use = resolveMiddleware(config.rootDir, module);
				use(app, options);
			}
			catch (err) {
				appLogger.error(err);
			}
		})
	;
};
