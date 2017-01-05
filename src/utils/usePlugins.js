
import config from '../config';
import mount from 'koa-mount';
import importModule from 'pot-js/lib/utils/importModule';
import { resolve } from 'path';
import { isObject, isString } from 'lodash';
import { appLogger } from './logger';
import redis, { getCache, setCache } from '../app/redis';

export default (parent) => {
	parent.use(function * (next) {
		this.claypot = {
			redis,
			getCache,
			setCache,
		};
		yield next;
	});

	config
		.plugins
		.map((plugin) => {
			if (isString(plugin)) {
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
				const createPlugin = importModule(module, {
					...config,
					prefer: resolve(__dirname, '../plugins'),
				});
				const plugin = createPlugin(options, config);
				parent.use(path ? mount(path, plugin) : plugin);
			}
			catch (err) {
				appLogger.error(err);
			}
		})
	;
};
