import logger from 'pot-logger';
import { isUndefined } from 'lodash';

export default function createProxyObject(getSource, debugName) {
	const logError = function logError(name) {
		logger.error(`${debugName} "${name}" is undefined`);
	};

	return new Proxy(
		{},
		{
			...Reflect,
			get(_, name) {
				const proxy = new Proxy(
					{},
					{
						...Reflect,
						get(_, key) {
							const dist = getSource()[name];
							if (isUndefined(dist)) {
								logError(name);
								return {}; // avoid throw `undefined.sth()` like error
							}
							return dist[key];
						},
						set(_, key, value) {
							const dist = getSource()[name];
							if (isUndefined(dist)) {
								logError(name);
								return false;
							}
							dist[key] = value;
							return true;
						},
						ownKeys(target) {
							return Reflect.ownKeys(target);
						},
					},
				);
				return proxy;
			},
		},
	);
}
