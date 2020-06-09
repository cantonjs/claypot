import config from '../config';
import { createLogger } from 'pot-logger';
import importFile from 'import-file';
import { resolve, normalize } from 'path';
import { isUndefined, flatten } from 'lodash';
import chalk from 'chalk';
import mount from 'koa-mount';

const middlewareLogger = createLogger('middleware', 'green');

const middlewaresWhiteList = [
	'responseTime',
	'httpLogger',
	'compress',
	'httpError',
	'helmet',
	'rewrites',
	'favicon',
	'clayInjection',
	'preproxy',
	'plugins',
	'proxy',
	'historyAPIFallback',
	'static',
	'postproxy',
	'notFound',
];

export default class Middlewares {
	constructor(app) {
		this._list = [];
		this._plugins = [];
		this._app = app;
		this._applyMiddleware = app.use.bind(app);

		app.registerPlugins = () => this._list.push(this._plugins);
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
			this._list.push(...args);
			return app;
		};
	}

	toResolvePlugins() {
		const app = this._app;
		app.use = (...args) => {
			args.forEach((arg) => {
				if (arg) {
					if (!arg.keyName) {
						arg.keyName = arg.name || 'anonymous';
					}
					middlewareLogger.trace(`"${arg.keyName}" plugin middleware added`);
				}
			});
			this._plugins.push(...args);
			return app;
		};
	}

	apply() {
		this._list.forEach(this._applyMiddleware);
		this._list = [];
		Reflect.deleteProperty(this, 'registerPlugins');
		Reflect.deleteProperty(this, 'mount');
		Reflect.deleteProperty(this, 'use');
	}

	list() {
		this._list = flatten(this._list);
		return this._list;
	}

	// resolve built-in middlewares
	async resolve() {
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

		const resolvers = modules
			.map(({ name, value }) => {
				const returnValue = { isEnabled: true, name };

				if (!value || value === 'false') {
					returnValue.isEnabled = false;
					return returnValue;
				}

				const options = value === true || value === 'true' ? {} : value;

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
			.map(({ options, name }) => {
				const modulePath = `./${normalize(name)}`;
				try {
					const use = importFile(modulePath, {
						cwd: config.baseDir,
						resolvers: [resolve(__dirname, '../middlewares')],
						useLoader: false,
					});
					return () => use(this._app, options);
				}
				catch (err) {
					err.message += ` in "${modulePath}" middleware`;
					middlewareLogger.error(err.message);
					middlewareLogger.error(err.stack);
				}
			})
			.filter(Boolean);

		for (const resolve of resolvers) {
			await resolve();
		}

		const app = this._app;
		app.use = (...args) => {
			args.forEach((arg) => {
				if (arg) {
					if (!arg.keyName) {
						arg.keyName = arg.name || 'anonymous';
					}
					middlewareLogger.trace(`"${arg.keyName}" plugin middleware added`);
				}
			});
			this._plugins.push(...args);
			return app;
		};
	}
}
