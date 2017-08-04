
import { createLogger, overrideConsoleInRuntime } from 'pot-logger';
import Types from 'prop-types';
import { isString } from 'lodash';
import { deprecatedProp } from '../utils/deprecated';

const logger = createLogger('config');

const propTypes = {
	baseDir: Types.string,
	clayInjection: Types.bool,
	compress: Types.oneOfType([Types.bool, Types.object]),
	configs: Types.object,
	cwd: Types.string,
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
	root: deprecatedProp(Types.string, 'please use "cwd" and "baseDir" instead'),
	ssl: Types.oneOfType([Types.bool, Types.object]),
	static: Types.oneOfType([Types.bool, Types.string, Types.object]),
	watch: Types.oneOfType([Types.bool, Types.object]),
};

export default function validate(config) {
	const unknownOptions = {};

	Object.keys(config).forEach((prop) => {
		if (!propTypes.hasOwnProperty(prop)) {
			unknownOptions[prop] = config[prop];
			logger.warn(`unknown prop "${prop}".`);
		}
	});

	if (Object.keys(unknownOptions).length) {
		logger.warn(
			'it is recommended to use a `configs` object',
			'if you want to set some custom props',
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
			Types.checkPropTypes(propTypes, config, 'key', 'config');
		},
		logger,
		([msg, ...args]) => [
			(isString(msg) ? msg.replace('Warning: ', '') : msg),
			...args,
		],
	);
}
