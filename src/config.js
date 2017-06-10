
import findPortSync from 'find-port-sync';
import { mergeWith, merge, isNull, isArray, isObject, uniq } from 'lodash';

const { NODE_ENV = 'development' } = process.env;

export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';

const config = {
	port: findPortSync(),
	ssl: {
		enable: false,
		port: findPortSync() + 1,
	},

	maxRestarts: isDev ? 0 : -1,
	responseTime: true,
	httpError: true,
	httpLogger: true,
	helmet: isProd,
	compress: isProd,
	favicon: true,
	clayInjection: true,
	plugins: [],
	historyAPIFallback: false,
	static: 'static',
	notFound: true,

	// redis: {
	// 	enable: false,
	// 	port: 6379,
	// 	host: '127.0.0.1',

	// 	// prefix: `${potConfig.name}:`,
	// 	prefix: 'claypot',

	// 	defaultExpiresIn: 60,
	// },
	watch: {
		enable: isDev,
	},
	dbs: {
		__default: {
			store: 'memory',
			cache: {
				max: 100,
				ttl: 60,
			},
		}
	},
};

export default config;

export const init = function init(newConfig) {
	return mergeWith(config, newConfig, (input, output) => {
		if (isArray(output)) {
			return uniq(isArray(input) ? input.concat(output) : output);
		}
		if (isNull(output) || Object.is(NaN, output)) {
			return input;
		}
		else if (isObject(output)) {
			return merge(input, output);
		}
		return output;
	});
};
