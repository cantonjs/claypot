
import { basename, resolve } from 'path';
import { inProj, cwd, resolveConfigFile } from './resolve';
import { merge, isFunction, isString, isUndefined } from 'lodash';
import { isDev, isProd, getEnv, setEnv } from './Env';

const name = getEnv('name');
const port = getEnv('port');
const command = getEnv('command');
const daemon = getEnv('daemon');

let maybeConfig = resolveConfigFile();

if (!maybeConfig) { maybeConfig = {}; }
if (isFunction(maybeConfig)) { maybeConfig = maybeConfig(); }

const defaultName = (function () {
	if (name) { return name; }

	try {
		const { name } = require(inProj('package.json'));
		if (!name) { throw new Error(); }
		return name;
	}
	catch (err) {
		return basename(cwd);
	}
}());

const userConfig = maybeConfig || {};

if (isString(userConfig.script)) {
	userConfig.script = { command: userConfig.script };
}

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
	rootDir: cwd,
	port: +port,
	maxRestarts: isDev ? 0 : -1,

	// 'ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', OFF
	logLevel: 'INFO',

	daemon,
	staticDir: 'static',
	middlewares: defaultMiddlewares,
	plugins: [],
	redis: {
		enable: false,
		port: 6379,
		host: '127.0.0.1',
		prefix: `${defaultName}:`,
		defaultExpiresIn: 60,
	},
	script: {
		pre: '',
		command,
		post: '',
	},
	watch: {
		enable: isDev,
		// dirs: [cwd],
		dirs: [resolve(cwd, 'src')],
		interval: 1000,
		ignoreDotFiles: true,
		// ignorePatterns: /node_modules/,
	},
	env: {
		NODE_ENV: isDev ? 'development' : 'production',
	},
}, userConfig);

if (isFunction(config.middlewares)) {
	config.middlewares = config.middlewares(defaultMiddlewares);
}

{
	const { env } = config;
	const setDefault = (key, defaultValue) => {
		if (!isUndefined(getEnv(key, env))) {
			setEnv(key, defaultValue, env);
		}
	};
	setDefault('name', name);
	setDefault('port', port);
	setEnv('daemon', daemon, env);
}

export const staticDir = inProj(config.staticDir);
export default config;
