
import { dirname } from 'path';
import { inProj, cwd, resolveConfigFile } from './resolve';
import { merge, isFunction } from 'lodash';
import { isDev, isProd } from './env';

let maybeConfig = resolveConfigFile();

if (!maybeConfig) { maybeConfig = () => ({}); }
if (!isFunction(maybeConfig)) { maybeConfig = () => maybeConfig; }

const defaultName = (function () {
	try {
		return require(inProj('package.json')).name;
	}
	catch (err) {
		return dirname(cwd);
	}
}());

const defaultMiddlewares = [
	'responseTime',
	'logger',
	'error',
	isProd && 'helmet',
	isProd && 'compress',
	'plugins',
	'rewtireIndex',
	'static',
	'notFound',
].filter(Boolean);

const config = merge({
	name: defaultName,
	port: 3000,
	staticDir: 'static',
	middlewares: defaultMiddlewares,
	plugins: [],
	debug: {
		enable: false,
	},
	redis: {
		enable: false,
		port: 6379,
		host: '127.0.0.1',
		prefix: `${defaultName}:`,
		defaultExpiresIn: 60,
	},
	scripts: {
		pre: [],
		post: [],
	},
	watch: {
		enable: isDev,
		directory: cwd,
		ignoreDotFiles: true,
	},
	env: {
		NODE_ENV: isDev ? 'development' : 'production',
	},
}, maybeConfig() || {});

if (isFunction(config.middlewares)) {
	config.middlewares = config.middlewares(defaultMiddlewares);
}

export const staticDir = inProj(config.staticDir);
export default config;
