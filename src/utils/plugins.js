
import importFile from 'import-file';
import { resolve } from 'path';
import { isObject, isFunction } from 'lodash';
import { appLogger } from './logger';

const middlewarePhasePlugins = [];

export async function initPlugins(config) {
	const asyncPlugins = [];

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
				appLogger.error(err);
			}
		})
		.filter(Boolean)
		.forEach((plugin) => {
			if (isFunction(plugin.initAsync)) {
				asyncPlugins.push(plugin);
			}
			if (isFunction(plugin.middleware)) {
				middlewarePhasePlugins.push(::plugin.middleware);
			}
		})
	;

	for (const plugin of asyncPlugins) {
		await plugin.initAsync();
	}
}

export function middlewarePhase(app, config) {
	return middlewarePhasePlugins.forEach((invokePlugin) => {
		invokePlugin(app, config);
	});
}
