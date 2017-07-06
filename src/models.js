
import importModuels from 'import-modules';
import { join } from 'path';
import { forEach } from 'lodash';
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
		});
	};

	const names = Object.keys(modules);

	await applyRegisterModels(register, names);

	names.forEach((name) => {
		const Model = modules[name].default;
		Model.prototype.$models = models;
		models[name] = new Model();
		appLogger.trace(`Created model "${name}"`);
	});

	appLogger.debug(`${names.length} model(s) created`);
}

export default models;
