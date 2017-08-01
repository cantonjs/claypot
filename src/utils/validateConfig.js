
import { createLogger, overrideConsoleInRuntime } from 'pot-logger';
import Types from 'prop-types';

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
	plugins: Types.arrayOf(Types.object),
	port: Types.number,
	production: Types.bool,
	proxy: Types.object,
	responseTime: Types.bool,
	rewriteConsole: Types.bool,
	root: Types.string,
	ssl: Types.oneOfType([Types.bool, Types.object]),
	static: Types.oneOfType([Types.bool, Types.string, Types.object]),
	watch: Types.oneOfType([Types.bool, Types.object]),
};

export default function validateConfig(config) {
	const logger = createLogger('config');
	Object.keys(config).forEach((key) => {
		if (!keyTypes.hasOwnProperty(key)) {
			logger.warn(
				`Unknown key "${key}".`,
				'If you want to use a custom key, please assign it to `configs` object,',
				`i.e. \`configs: { ${key}: ${JSON.stringify(config[key])} }\``,
			);
		}
	});

	overrideConsoleInRuntime(
		() => {
			Types.checkPropTypes(keyTypes, config, 'key', 'config');
		},
		logger,
		([msg = '']) => [msg.replace('Warning: ', '')],
	);
}
