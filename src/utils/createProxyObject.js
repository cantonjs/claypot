import logger from 'pot-logger';
import { isUndefined } from 'lodash';

export default function createProxyObject(source, debugName) {
	const logError = function logError(name) {
		logger.error(`${debugName} "${name}" is undefined`);
	};
	return new Proxy(
		{},
		{
			get(_, name) {
				const proxy = new Proxy(
					{},
					{
						get(_, key) {
							const dist = source[name];
							if (isUndefined(dist)) {
								logError(name);
								return {}; // avoid throw `undefined.sth()` like error
							}
							return dist[key];
						},
						set(_, key, value) {
							const dist = source[name];
							if (isUndefined(dist)) {
								logError(name);
								return false;
							}
							dist[key] = value;
							return true;
						},
					},
				);
				return proxy;
			},
		},
	);
}
