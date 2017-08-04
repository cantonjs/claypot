
import importFile from 'import-file';
import { resolve } from 'path';
import { isObject, isFunction } from 'lodash';
import { createLogger } from 'pot-logger';
import httpProxy from './httpProxy';

const logger = createLogger('plugin', 'cyan');

const registerDatabasePhasePlugins = [];
const initServerPhasePlugins = [];
const proxyPhasePlugins = [];
const middlewarePhasePlugins = [];

const traceNewPlugin = (PluginModule) => {
	logger.trace(`"${PluginModule.name}" found`);
};

export function initPlugins(config) {
	config
		.plugins
		.map((plugin) => {
			if (!plugin) {
				return { enable: false };
			}

			if (Array.isArray(plugin) && plugin[0]) {
				return {
					module: plugin[0],
					options: plugin[1],
				};
			}

			if (plugin.constructor === Object && plugin.module) {
				return plugin;
			}
			return { module: plugin };
		})
		.filter(({ enable = true }) => enable)
		.map((plugin) => {
			const { module, options = {} } = plugin;

			if (isObject(module)) {
				traceNewPlugin(module.constructor);
				return plugin;
			}
			if (isFunction(module)) {
				const PluginModule = module;
				traceNewPlugin(PluginModule);
				return new PluginModule(options);
			}

			try {
				const PluginModule = importFile(module, {
					cwd: config.baseDir,
					resolvers: [resolve(__dirname, '../plugins')],
					useLoader: false,
				});

				traceNewPlugin(PluginModule);

				return new PluginModule(options, config);
			}
			catch (err) {
				logger.error(err);
			}
		})
		.forEach((plugin) => {
			if (isFunction(plugin.registerDatabase)) {
				registerDatabasePhasePlugins.push(plugin);
			}
			if (isFunction(plugin.initServer)) {
				initServerPhasePlugins.push(plugin);
			}
			if (isFunction(plugin.proxy)) {
				proxyPhasePlugins.push(plugin);
			}
			if (isFunction(plugin.middleware)) {
				middlewarePhasePlugins.push(plugin);
			}
		})
	;
}

function middlewarePhase(app, config) {
	return middlewarePhasePlugins.forEach((plugin) => {
		plugin.middleware(app, config);
		logger.trace(`"${plugin.constructor.name}" middleware created`);
	});
}

function proxyPhase(app, config) {
	return proxyPhasePlugins.forEach((plugin) => {
		plugin.proxy(app, httpProxy, config);
		logger.trace(`"${plugin.constructor.name}" proxy created`);
	});
}

export async function applyInitServer(...args) {
	for (const plugin of initServerPhasePlugins) {
		await plugin.initServer(...args);
		logger.trace(`"${plugin.constructor.name}" server initialzed`);
	}
}

export async function applyRegisterDatabase(...args) {
	for (const plugin of registerDatabasePhasePlugins) {
		await plugin.registerDatabase(...args);
		logger.trace(`"${plugin.constructor.name}" database registed`);
	}
}

export function applyMiddlewares(app, config) {
	proxyPhase(app, config);
	middlewarePhase(app, config);
}
