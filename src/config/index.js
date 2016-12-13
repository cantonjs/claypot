
import { dirname, resolve, sep } from 'path';
import { merge, isFunction, isString, isUndefined } from 'lodash';
import resolveConfigFile from './resolveConfigFile';
import { isDev, isProd, getEnv, setEnv } from './env';

export globalConfig from './global';

const name = getEnv('name');
const port = getEnv('port');
const command = getEnv('command');
const daemon = getEnv('daemon');
const logLevel = getEnv('log_level');
const entry = getEnv('entry');

const cwd = process.cwd();
const rootDir = entry ? resolve(cwd, entry) : cwd;
const inProj = (...args) => resolve(rootDir, ...args);

let maybeConfig = resolveConfigFile(inProj);

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
		const sepRegExp = new RegExp(sep, 'g');
		return dirname(rootDir).replace(sepRegExp, '_');
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
	rootDir,
	port: +port,
	maxRestarts: isDev ? 0 : -1,
	staticDir: 'static',
	logsDir: '.logs',
	logLevel,
	daemon,
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
		dirs: ['.'],
		interval: 1000,
		ignoreDotFiles: true,
	},
	env: {
		NODE_ENV: isDev ? 'development' : 'production',
	},
}, userConfig);

if (isFunction(config.middlewares)) {
	config.middlewares = config.middlewares(defaultMiddlewares);
}

config.staticDir = inProj(config.staticDir);
config.logsDir = inProj(config.logsDir);

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
	setEnv('entry', entry, env);
}

export { isDev, isProd };
export default config;
