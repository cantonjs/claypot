import importFile from 'import-file';
import { resolve } from 'path';
import { isObject, isFunction } from 'lodash';
import { createLogger } from 'pot-logger';

let plugins = [];
const logger = createLogger('plugin', 'cyan');

function init(config) {
	const traceNewPlugin = (PluginModule) => {
		logger.trace(`"${PluginModule.name}" found`);
	};

	plugins = config.plugins
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
				err.message += ` in "${module}" plugin`;
				logger.error(err);
			}
		})
		.filter(Boolean);
}

const findCurrentPlugins = (phase) => plugins.filter((plugin) => plugin[phase]);

const deprecatedPhases = ['initServer', 'registerDatabase'];

const traceApplied = (plugin, phase) => {
	const pluginName = plugin.constructor.name;
	if (deprecatedPhases.includes(phase)) {
		logger.warn(`Phase "${phase}" in "${pluginName}" has been deprecated.`);
	}
	logger.trace(`"${pluginName}" phase "${phase}" applied.`);
};

export default {
	init,
	sync(phase, ...args) {
		findCurrentPlugins(phase).forEach((plugin) => {
			plugin[phase](...args);
			traceApplied(plugin, phase);
		});
	},
	async sequence(phase, ...args) {
		for (const plugin of findCurrentPlugins(phase)) {
			await plugin[phase](...args);
			traceApplied(plugin, phase);
		}
	},
	async parallel(phase, ...args) {
		return Promise.all(
			findCurrentPlugins(phase).map(async (plugin) => {
				await plugin[phase](...args);
				traceApplied(plugin, phase);
			}),
		);
	},
};
