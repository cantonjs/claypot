
import { createLogger, overrideConsoleInRuntime } from 'pot-logger';
import Types from 'prop-types';
import { isString } from 'lodash';

const keyTypes = {
	clayInjection: Types.bool,
	compress: Types.oneOfType([Types.bool, Types.object]),
	configs: Types.object,
	daemon: Types.bool,
	dbs: Types.object,
	env: Types.object,
	execArgs: Types.oneOfType([Types.string, Types.arrayOf(Types.string)]),
	execCommand: Types.string,
	favicon: Types.oneOfType([Types.bool, Types.string]),
	helmet: Types.oneOfType([Types.bool, Types.object]),
	historyAPIFallback: Types.oneOfType([Types.bool, Types.object]),
	httpError: Types.oneOfType([Types.bool, Types.object]),
	httpLogger: Types.bool,
	inspect: Types.oneOfType([Types.bool, Types.string, Types.object]),
	logLevel: Types.oneOfType([Types.string, Types.object]),
	logsDir: Types.string,
	maxRestarts: Types.number,
	models: Types.string,
	name: Types.string,
	notFound: Types.bool,
	overrideConsole: Types.bool,
	plugins: Types.arrayOf(Types.object),
	port: Types.number,
	production: Types.bool,
	proxy: Types.object,
	responseTime: Types.bool,
	root: Types.string,
	ssl: Types.oneOfType([Types.bool, Types.object]),
	static: Types.oneOfType([Types.bool, Types.string, Types.object]),
	watch: Types.oneOfType([Types.bool, Types.object]),
};

export default function validate(config) {
	const logger = createLogger('config');
	const unknownOptions = {};

	Object.keys(config).forEach((key) => {
		if (!keyTypes.hasOwnProperty(key)) {
			unknownOptions[key] = config[key];
			logger.warn(`unknown key "${key}".`);
		}
	});

	if (Object.keys(unknownOptions).length) {
		logger.warn(
			'it is recommended to use a `configs` object',
			'if you want to set some custom keys',
		);
		if (!config.daemon) {
			logger.warn('i.e.\n');
			console.warn(
				'"configs":',
				JSON.stringify(unknownOptions, null, 2),
				'\n'
			);
		}
	}

	overrideConsoleInRuntime(
		() => {
			Types.checkPropTypes(keyTypes, config, 'key', 'config');
		},
		logger,
		([msg, ...args]) => [
			(isString(msg) ? msg.replace('Warning: ', '') : msg),
			...args,
		],
	);
}
