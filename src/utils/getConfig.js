
import { basename } from 'path';
import { inProj, cwd, resolveConfigFile } from './resolve';
import { merge, isFunction, isString, upperCase } from 'lodash';
import { isDev, isProd, name, port, command } from './env';
import pkg from '../../package.json';

const prefix = upperCase(pkg.name);

let maybeConfig = resolveConfigFile();

if (!maybeConfig) { maybeConfig = () => ({}); }
if (!isFunction(maybeConfig)) { maybeConfig = () => maybeConfig; }

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
	port: +port,
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
		directory: cwd,
		ignoreDotFiles: true,
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
	const envNameKey = `${prefix}_NAME`;
	const envPortKey = `${prefix}_PORT`;

	env[envNameKey] || (env[envNameKey] = name);
	env[envPortKey] || (env[envPortKey] = port);
}

export const staticDir = inProj(config.staticDir);
export default config;
