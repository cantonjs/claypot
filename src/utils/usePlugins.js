
import config from './getConfig';
import mount from 'koa-mount';
import { resolvePlugin } from './resolve';
import { isObject, isString, isFunction } from 'lodash';

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
			const createPlugin = resolvePlugin(module);
			const plugin = createPlugin(options);
			parent.use(path ? mount(path, plugin) : plugin);
		})
	;
};
