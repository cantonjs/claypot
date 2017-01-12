
import findPortSync from 'find-port-sync';
import { mergeWith, isNull, isArray, uniq } from 'lodash';

const {
	NODE_ENV = 'development',

	PORT = findPortSync(),

	REDIS_PORT = 6379,
	REDIS_HOST = '127.0.0.1',
	REDIS_PREFIX = 'claypot', // TODO
} = process.env;

export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';

const config = {
	port: PORT,
	ssl: {
		enable: false,
		port: findPortSync() + 1,
	},
	staticDir: 'static',
	maxRestarts: isDev ? 0 : -1,
	middlewares: [
		'responseTime',
		'logger',
		'error',
		isProd && 'helmet',
		isProd && 'compress',
		'favicon',
		'plugins',
		'rewriteIndex',
		'static',
		'notFound',
	].filter(Boolean),
	plugins: [],
	redis: {
		enable: false,
		port: REDIS_PORT,
		host: REDIS_HOST,

		// prefix: `${potConfig.name}:`,
		prefix: REDIS_PREFIX,

		defaultExpiresIn: 60,
	},
	watch: {
		enable: isDev,
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
		return output;
	});
};
