
import config from './getConfig';
import { resolveMiddleware } from './resolve';
import { isObject, isString, isFunction } from 'lodash';

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
			const use = resolveMiddleware(module);
			use(app, options);
		})
	;
};
