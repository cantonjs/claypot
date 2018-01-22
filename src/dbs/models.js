import { join } from 'path';
import { createLogger } from 'pot-logger';
import Plugins from '../utils/plugins';
import importModules from '../utils/importModules';
import createProxyObject from '../utils/createProxyObject';
import { lowerFirst, upperFirst } from 'lodash';

const logger = createLogger('model', 'blueBright');
const models = {};
const Models = new Map();

const resolveModels = function resolveModels(baseDir, modelsDir) {
	const dir = join(baseDir, modelsDir);
	const vanillaModules = importModules(dir);

	Object.keys(vanillaModules).forEach((key) => {
		let Model = vanillaModules[key];
		Model = Model.default || Model;

		const { name, keyName } = Model;

		const uniqueKey = lowerFirst(keyName || name || key);
		Models.set(uniqueKey, Model);
	});

	return Models;
};

const createModels = function createModels() {
	for (const [uniqueKey, Model] of Models) {
		Object.keys(Model).forEach((key) => {
			const method = Model[key];
			const prop = key.startsWith('$') ? key : `$${key}`;
			Model.prototype[prop] = method;
		});
		const value = new Model();

		if (!models[uniqueKey]) {
			Object.defineProperty(models, uniqueKey, { value, enumerable: true });
		}

		const uppperKey = upperFirst(uniqueKey);
		if (uppperKey !== uniqueKey && !models[uppperKey]) {
			Object.defineProperty(models, uppperKey, { value });
		}

		logger.trace(`"${uniqueKey}" created`);
	}
	const { size } = Models;
	logger.debug(`${size} model${size > 1 ? 's' : ''} created`);
};

export async function initModels(dbs, appConfig) {
	const { models: modelsDir, baseDir } = appConfig;

	resolveModels(baseDir, modelsDir);
	await Plugins.sync('models', Models);
	createModels();
}

export function getModelKeys() {
	return [...Models.keys()];
}

export function getModels() {
	return models;
}

export default createProxyObject(models, 'Models', { ignoreCase: true });
