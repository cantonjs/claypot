
import { createLogger, overrideConsoleInRuntime } from 'pot-logger';
import { isString } from 'lodash';
import { deprecatedProp as deprecated } from '../utils/deprecated';
import {
	string, number, bool, object, func, array, arrayOf, oneOfType, oneOf, shape,
	checkPropTypes,
} from 'prop-types';

const logger = createLogger('config');

const propTypes = {
	baseDir: string,
	clayInjection: bool,
	compress: oneOfType([bool, object]),
	configs: object,
	cwd: string,
	daemon: bool,
	dbs: object,
	env: object,
	execArgs: oneOfType([string, arrayOf(string)]),
	execCommand: string,
	favicon: oneOfType([bool, string]),
	helmet: oneOfType([bool, object]),
	historyAPIFallback: oneOfType([bool, object]),
	httpError: oneOfType([bool, object]),
	httpLogger: bool,
	inspect: oneOfType([bool, string, number]),
	logLevel: oneOfType([string, object]),
	logsDir: string,
	maxRestarts: number,
	models: string,
	name: string,
	notFound: bool,
	outputHost: oneOfType([
		bool,
		shape({
			enable: bool,
			name: string,
			port: number,
			protocol: oneOf(['http', 'https']),
		}),
	]),
	overrideConsole: bool,
	plugins: arrayOf(
		oneOfType([
			shape({
				module: oneOfType([
					string,
					object,
					func,
				]).isRequired,
				options: object,
				enable: bool,
			}),
			string,
			array,
		]),
	),
	port: number,
	production: bool,
	proxy: object,
	responseTime: bool,
	root: deprecated(string, 'please use "cwd" and "baseDir" instead'),
	ssl: oneOfType([
		bool,
		shape({
			key: string.isRequired,
			cert: string.isRequired,
			port: number,
		}),
	]),
	static: oneOfType([bool, string, object]),
	watch: oneOfType([
		bool,
		shape({
			enable: bool,
			dirs: oneOfType([
				string,
				arrayOf(string),
			]),
			ignoreDotFiles: bool,
			ignoreNodeModulesDir: bool,
		}),
	]),
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
			checkPropTypes(propTypes, config, 'key', 'config');
		},
		logger,
		([msg, ...args]) => [
			(isString(msg) ? msg.replace('Warning: ', '') : msg),
			...args,
		],
	);
}
