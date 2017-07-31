
import importModules from 'import-modules';
import { join } from 'path';
import { forEach, isFunction } from 'lodash';
import { createLogger } from 'pot-logger';
import createProxyObject from './utils/createProxyObject';

const logger = createLogger('model', 'blueBright');
const models = {};

export async function initModels(dbs, appConfig) {
	const { models: modelsDir, root } = appConfig;
	const modules = importModules(join(root, modelsDir));

	const extendModel = (Model, key, extension) => {
		const prop = `$${key}`;
		Model = Model.default || Model;
		Model[prop] = extension;
		if (isFunction(Model)) { Model.prototype[prop] = extension; }
		return Model;
	};

	const registerDb = (key, dbModels) => {
		forEach(dbModels, (dbModel, name) => {
			extendModel(modules[name], key, dbModel);
		});
	};

	const names = Object.keys(modules);

	dbs.forEach(({ key, createModels, options }) => {
		registerDb(key, createModels(names, options));
	});

	names.forEach((name) => {
		const Model = extendModel(modules[name], 'models', models);
		models[name] = isFunction(Model) ? new Model() : Model;
		logger.trace(`created model "${name}"`);
	});

	logger.debug(
		`${names.length} model${names.length > 1 ? 's' : ''} created`,
	);
}

export function getModels() {
	return models;
}

export default createProxyObject(models, 'Models');
