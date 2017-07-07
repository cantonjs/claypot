
import importModuels from 'import-modules';
import { join } from 'path';
import { forEach, isUndefined, isFunction } from 'lodash';
import { applyRegisterModels } from './utils/plugins';
import { appLogger } from './utils/logger';

const models = {};

export async function init(modelsDir, root, dbs) {
	const modules = importModuels(join(root, modelsDir));

	const register = (dbName, dbModels) => {
		const prop = `$${dbName}`;
		forEach(dbModels, (dbModel, name) => {
			const Model = modules[name].default;
			Model.prototype[prop] = dbModel;
			Model[prop] = dbModel;
		});
	};

	const names = Object.keys(modules);

	await applyRegisterModels(register, names);

	names.forEach((name) => {
		const Model = modules[name].default;
		Model.prototype.$models = models;
		Model.$models = models;
		models[name] = new Model();
		appLogger.trace(`Created model "${name}"`);
	});

	appLogger.debug(`${names.length} model(s) created`);
}

export function getModels() {
	return models;
}

export default new Proxy({}, {
	get(_1, name) {
		const model = new Proxy({}, {
			get(_2, key) {
				const m = models[name];
				if (isUndefined(m)) {
					appLogger.error(`Models "${name}" is undefined`);
					return;
				}
				if (isUndefined(m[key])) {
					appLogger.error(`Models "${name}.${key}" is undefined`);
					return;
				}
				return isFunction(m[key]) ? m[key].bind(m) : m[key];
			},
		});
		return model;
	}
});
