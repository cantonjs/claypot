import pathToRegexp from 'path-to-regexp';
import compose from 'koa-compose';

const cachedPathRegexps = new Map();
const ensurePathRegexp = function ensurePathRegexp(path) {
	const res = cachedPathRegexps.get(path);
	if (res) return res;
	const keys = [];
	const pathRegexp = pathToRegexp(path, keys);
	const pathOptions = { keys, pathRegexp };
	cachedPathRegexps.set(path, pathOptions);
	return pathOptions;
};

export default class Routes {
	constructor() {
		this._routes = {};
	}

	set(path, method, fns) {
		const routes = this._routes;
		const methodsMap = routes[path] || (routes[path] = new Map());
		const { keys, pathRegexp } = ensurePathRegexp(path);
		const route = {
			keys,
			pathRegexp,
			middleware: compose(Array.isArray(fns) ? fns : [fns]),
		};
		methodsMap.set(method.toUpperCase(), route);
	}

	get(path, method) {
		const routes = this._routes;
		if (!routes) return null;
		const methodsMap = routes[path];
		if (!methodsMap) return null;
		const route = methodsMap.get(method.toUpperCase());
		if (route) return route;
		if (methodsMap.has('ALL')) return methodsMap.get('ALL');
		return { code: 405, headers: { Allow: [...methodsMap.keys()].join(', ') } };
	}
}
