
import importModule from 'pot-js/lib/utils/importModule';
import { resolve } from 'path';
import { isObject, isFunction } from 'lodash';
import { appLogger } from './logger';

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
				const PluginModule = importModule(module, {
					...config,
					prefer: resolve(__dirname, '../plugins'),
				});
				return new PluginModule(options, config);
			}
			catch (err) {
				appLogger.error(err);
			}
		})
		.filter(Boolean)
		.forEach((plugin) => {
			if (isFunction(plugin.middleware)) {
				middlewarePhasePlugins.push(::plugin.middleware);
			}
		})
	;
}

export function middlewarePhase(app, config) {
	return middlewarePhasePlugins.forEach((invokePlugin) => {
		invokePlugin(app, config);
	});
}
