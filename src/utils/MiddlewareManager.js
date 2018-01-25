import config from '../config';
import { createLogger } from 'pot-logger';
import importFile from 'import-file';
import { resolve, normalize } from 'path';
import { isBoolean, isUndefined } from 'lodash';
import chalk from 'chalk';
import mount from 'koa-mount';

const middlewareLogger = createLogger('middleware', 'green');

const middlewaresWhiteList = [
	'responseTime',
	'httpLogger',
	'compress',
	'httpError',
	'helmet',
	'favicon',
	'clayInjection',
	'plugins',
	'proxy',
	'historyAPIFallback',
	'static',
	'notFound',
];

export default class MiddlewareManager {
	constructor(app) {
		this._middlewares = [];
		this._app = app;
		this._use = app.use.bind(app);

		app.mount = (path, ...args) => {
			const middleware = mount(path, ...args);
			middleware.keyName = `mount("${path}")`;
			return app.use(middleware);
		};
		app.use = (...args) => {
			args.forEach((arg) => {
				if (arg) {
					if (!arg.keyName) {
						arg.keyName = arg.name || 'anonymous';
					}
					middlewareLogger.trace(`"${arg.keyName}" added`);
				}
			});
			this._middlewares.push(...args);
			return app;
		};
	}

	apply() {
		const use = this._use;
		const applyMiddleware = function applyMiddleware(middleware) {
			if (Array.isArray(middleware)) {
				middleware.forEach(applyMiddleware);
			}
			else {
				use(middleware);
			}
		};
		this._middlewares.forEach(applyMiddleware);
		this._middlewares = [];
	}

	middlewares() {
		return this._middlewares;
	}

	resolve() {
		let modules = [];
		if (Array.isArray(config.middlewares)) {
			modules = config.middlewares;
		}
		else {
			modules = middlewaresWhiteList.map((name) => ({
				name,
				value: config[name],
			}));
		}

		modules
			.map(({ name, value }) => {
				const returnValue = { isEnabled: true, name };

				if (!value || value === 'false') {
					returnValue.isEnabled = false;
					return returnValue;
				}

				let options = isBoolean(value) ? {} : value;
				if (options === 'true') {
					options = {};
				}

				if (
					(Array.isArray(options) && !options.length) ||
					(!isUndefined(options.enable) && !options.enable)
				) {
					returnValue.isEnabled = false;
					return returnValue;
				}

				returnValue.options = options;
				return returnValue;
			})
			.filter(({ isEnabled, name }) => {
				if (!isEnabled) {
					middlewareLogger.trace(`"${name}"`, chalk.red('disabled'));
				}
				return isEnabled;
			})
			.forEach(({ options, name }) => {
				const module = `./${normalize(name)}`;
				try {
					const use = importFile(module, {
						cwd: config.baseDir,
						resolvers: [resolve(__dirname, '../middlewares')],
						useLoader: false,
					});
					use(this._app, options);
				}
				catch (err) {
					err.message += ` in "${module}" middleware`;
					middlewareLogger.error(err);
				}
			});
	}
}
