
import { appLogger } from './logger';
import { isFunction, isUndefined } from 'lodash';

const _cacheFns = Symbol('cacheFns');

export default function createProxyObject(source, debugName) {
	return new Proxy({}, {
		get(_, name) {
			const proxy = new Proxy({}, {
				get(_, key) {
					const dist = source[name];
					if (isUndefined(dist)) {
						appLogger.error(`${debugName} "${name}" is undefined`);
						return {}; // avoid throw `undefined.sth()` like error
					}
					const result = dist[key];
					if (isFunction(result)) {
						if (!dist[_cacheFns]) {
							dist[_cacheFns] = {};
						}

						if (!dist[_cacheFns][key]) {
							dist[_cacheFns][key] = result.bind(dist);
						}

						return dist[_cacheFns][key];
					}
					else {
						return result;
					}
				},
			});
			return proxy;
		}
	});
}
