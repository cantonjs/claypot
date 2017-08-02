
import findPortSync from 'find-port-sync';
import { basename } from 'path';
import { isObject } from 'lodash';

export default function applyDefaults(config, userConfig, isProd) {
	const port = findPortSync(3000);
	const cwd = process.cwd();

	const { daemon = false } = userConfig;

	const defaultOptions = {
		clayInjection: true,
		compress: isProd,
		configs: {},
		daemon,
		dbs: {},
		execArgs: [],
		execCommand: process.execPath,
		favicon: true,
		helmet: isProd,
		historyAPIFallback: false,
		httpError: true,
		httpLogger: true,
		inspect: false,
		logLevel: isProd ? 'INFO' : 'DEBUG',
		logsDir: '.logs',
		maxRestarts: isProd ? -1 : 0,
		models: 'models',
		name: basename(cwd),
		notFound: true,
		overrideConsole: daemon,
		plugins: [],
		port,
		production: isProd,
		proxy: {},
		responseTime: true,
		root: cwd,
		ssl: false,
		static: 'static',
		watch: false,
	};

	Object.assign(config, defaultOptions, userConfig);

	const { ssl, watch } = config;

	if (ssl) {
		config.ssl = isObject(ssl) ? ssl : {
			port: port + 1,
		};
	}

	if (watch) {
		config.watch = isObject(watch) ? watch : {};
	}

	return config;
}
