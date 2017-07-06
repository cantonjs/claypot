
import { isString, forEach } from 'lodash';
import { applyRegisterModels } from './utils/plugins';
import mapModules from './utils/mapModules';
import { appLogger } from './utils/logger';

const models = {};

export async function init(modelsConfig, root, dbs) {
	if (isString(modelsConfig)) {
		modelsConfig = { dir: modelsConfig };
	}
	const { dir, ext } = modelsConfig;
	const modules = await mapModules(dir, root, ext);

	const register = (dbName, dbModels) => {
		const prop = `$${dbName}`;
		forEach(dbModels, (dbModel, name) => {
			const Model = modules[name];
			Model.prototype[prop] = dbModel;
		});
	};

	const names = Object.keys(modules);

	applyRegisterModels(register, names);

	names.forEach((name) => {
		const Model = modules[name];
		Model.prototype.$models = models;
		models[name] = new Model();
		appLogger.trace(`Created model "${name}"`);
	});

	appLogger.debug(`${names.length} model(s) created`);
}

export default models;
