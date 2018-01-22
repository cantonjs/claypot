import findPortSync from 'find-port-sync';
import { basename, resolve } from 'path';
import { isObject, isUndefined, defaults } from 'lodash';

export default function applyDefaults(config, userConfig, isProd) {
	const port = findPortSync(3000);
	const cwd = process.cwd();

	const { daemon = false } = userConfig;

	if (isUndefined(userConfig.cwd) && userConfig.root) {
		userConfig.cwd = resolve(userConfig.root);
	}

	const defaultOptions = {
		baseDir: '',
		clayInjection: true,
		compress: isProd,
		configs: {},
		cwd,
		daemon,
		dbs: {},
		execArgs: [],
		execCommand: process.execPath,
		favicon: true,
		helmet: isProd,
		historyAPIFallback: false,
		host: '',
		httpError: true,
		httpLogger: true,
		inspect: false,
		logLevel: isProd ? 'INFO' : 'DEBUG',
		logsDir: '.logs',
		maxRestarts: isProd ? -1 : 0,
		models: 'models',
		name: basename(cwd),
		notFound: true,
		outputHost: !isProd,
		overrideConsole: daemon,
		plugins: [],
		port,
		production: isProd,
		proxy: {},
		responseTime: true,
		ssl: false,
		static: 'static',
		watch: false,
	};

	defaults(config, userConfig, defaultOptions);

	const { ssl, watch, outputHost } = config;

	config.baseDir = resolve(config.cwd, config.baseDir);

	if (ssl) {
		config.ssl = defaults(isObject(ssl) ? ssl : {}, {
			enable: true,
			port: port + 1,
		});
	}

	if (watch) {
		config.watch = isObject(watch) ? watch : {};
		if (isUndefined(config.watch.enable)) {
			config.watch.enable = true;
		}
	}

	if (outputHost) {
		config.outputHost = isObject(outputHost) ? outputHost : {};
		const enabledSSL = ssl && ssl.enable;
		const defaultOutputHostConfig = {
			enable: true,
			name: config.name,
			port: enabledSSL ? ssl.port : config.port,
			protocol: enabledSSL ? 'https' : 'http',
		};
		if (config.host) {
			defaultOutputHostConfig.host = config.host;
		}
		defaults(config.outputHost, defaultOutputHostConfig);
	}

	return config;
}
