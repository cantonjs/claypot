
import config from '../config';
import { createLogger } from 'pot-logger';
import importFile from 'import-file';
import { resolve, normalize } from 'path';
import { isBoolean, isUndefined } from 'lodash';
import chalk from 'chalk';

const middlewareLogger = createLogger('middleware', 'green');

const middlewaresWhiteList = [
	'responseTime',
	'httpLogger',
	'httpError',
	'helmet',
	'compress',
	'favicon',
	'clayInjection',
	'plugins',
	'proxy',
	'historyAPIFallback',
	'static',
	'notFound',
];

const perform = function perform(app, middlewares) {
	middlewares
		.map(({ name, value }) => {
			const returnValue = { isEnabled: true, name };

			if (!value || value === 'false') {
				returnValue.isEnabled = false;
				return returnValue;
			}

			let options = isBoolean(value) ? {} : value;
			if (options === 'true') { options = {}; }

			if ((Array.isArray(options) && !options.length) ||
				(!isUndefined(options.enable) && !options.enable)
			) {
				returnValue.isEnabled = false;
				return returnValue;
			}

			returnValue.options = options;
			return returnValue;
		})
		.filter(({ isEnabled, name }) => {
			middlewareLogger.trace(
				`"${name}"`,
				isEnabled ? chalk.green('enabled') : chalk.red('disabled'),
			);
			return isEnabled;
		})
		.forEach(({ options, name }) => {
			try {
				const use = importFile(`./${normalize(name)}`, {
					cwd: config.baseDir,
					resolvers: [resolve(__dirname, '../middlewares')],
					useLoader: false,
				});
				use(app, options);
			}
			catch (err) {
				middlewareLogger.error(err);
			}
		})
	;
};

export default function useMiddlewares(app) {
	let middlewares = [];
	if (Array.isArray(config.middlewares)) { middlewares = config.middlewares; }
	else {
		middlewares = middlewaresWhiteList.map((name) => ({
			name,
			value: config[name],
		}));
	}

	perform(app, middlewares);
}
