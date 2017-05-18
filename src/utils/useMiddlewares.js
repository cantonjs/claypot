
import config from '../config';
import importModule from 'pot-js/lib/utils/importModule';
import { resolve } from 'path';
import { isBoolean, isUndefined } from 'lodash';
import { appLogger } from './logger';

const middlewaresWhiteList = [
	'responseTime',
	'httpLogger',
	'httpError',
	'helmet',
	'compress',
	'favicon',
	'proxy',
	'plugins',
	'historyAPIFallback',
	'static',
	'notFound',
];

const perform = function perform(app, middlewares) {
	middlewares
		.map(({ name, value }) => {
			const returnValue = { isEnabled: true };

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
			returnValue.name = name;
			return returnValue;
		})
		.filter(({ isEnabled }) => isEnabled)
		.forEach(({ options, name }) => {
			try {
				const use = importModule(name, {
					root: config.root,
					prefer: resolve(__dirname, '../middlewares'),
				});
				use(app, options);
			}
			catch (err) {
				appLogger.error(err);
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
