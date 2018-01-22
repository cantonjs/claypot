import logger from 'pot-logger';
import { isUndefined } from 'lodash';

export default function createProxyObject(source, debugName) {
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
								logger.error(`${debugName} "${name}" is undefined`);
								return {}; // avoid throw `undefined.sth()` like error
							}
							return dist[key];
						},
					},
				);
				return proxy;
			},
		},
	);
}
