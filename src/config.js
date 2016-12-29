
import findPortSync from 'find-port-sync';
import { mergeWith, isNull, isArray } from 'lodash';

const { NODE_ENV = 'development' } = process.env;

export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';

const config = {
	port: findPortSync(),
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
		port: 6379,
		host: '127.0.0.1',

		// prefix: `${potConfig.name}:`,
		prefix: 'claypot',

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
			return isArray(input) ? input.concat(output) : output;
		}
		if (isNull(output) || isNaN(output)) {
			return input;
		}
		return output;
	});
};
