
import config from '../config';
import mount from 'koa-mount';
import { resolvePlugin } from './resolve';
import { isObject, isString, isFunction } from 'lodash';
import { appLogger } from './logger';

export default (parent) => {
	config
		.plugins
		.map((plugin) => {
			if (isString(plugin) || isFunction(plugin)) {
				return { module: plugin };
			}
			else if (isObject(plugin)) {
				return plugin;
			}
			else {
				throw `Plugin ${plugin} is INVALID.`;
			}
		})
		.filter(({ enable = true }) => enable)
		.forEach(({ path, module, options = {} }) => {
			try {
				const createPlugin = resolvePlugin(config.root, module);
				const plugin = createPlugin(options);
				parent.use(path ? mount(path, plugin) : plugin);
			}
			catch (err) {
				appLogger.error(err);
			}
		})
	;
};
