
import importFile from 'import-file';
import { resolve } from 'path';
import { isObject, isFunction } from 'lodash';
import logger from 'pot-logger';
import httpProxy from './httpProxy';

const registerDatabasePhasePlugins = [];
const initServerPhasePlugins = [];
const proxyPhasePlugins = [];
const middlewarePhasePlugins = [];

export function initPlugins(config) {
	config
		.plugins
		.map((plugin) => {
			if (!plugin) {
				return { enable: false };
			}
			else if (plugin.constructor === Object && plugin.module) {
				return plugin;
			}
			return { module: plugin };
		})
		.map((plugin) => {
			const { module, options = {}, enable = true } = plugin;

			if (!enable) { return; }

			if (isObject(module)) { return plugin; }
			if (isFunction(module)) {
				const PluginModule = module;
				return new PluginModule(options);
			}

			try {
				const PluginModule = importFile(module, {
					cwd: config.root,
					resolvers: [resolve(__dirname, '../plugins')],
					useLoader: false,
				});
				return new PluginModule(options, config);
			}
			catch (err) {
				logger.error(err);
			}
		})
		.filter(Boolean)
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
	});
}

function proxyPhase(app, config) {
	return proxyPhasePlugins.forEach((plugin) => {
		plugin.proxy(app, httpProxy, config);
	});
}

export async function applyInitServer(...args) {
	for (const plugin of initServerPhasePlugins) {
		await plugin.initServer(...args);
	}
}

export async function applyRegisterDatabase(...args) {
	for (const plugin of registerDatabasePhasePlugins) {
		await plugin.registerDatabase(...args);
	}
}

export function applyMiddlewares(app, config) {
	proxyPhase(app, config);
	middlewarePhase(app, config);
}
