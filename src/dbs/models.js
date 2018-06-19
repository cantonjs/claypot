import { createLogger } from 'pot-logger';
import importModules from '../utils/importModules';
import createProxyObject from '../utils/createProxyObject';
import { lowerFirst, upperFirst } from 'lodash';

const logger = createLogger('model', 'blueBright');
const models = {};
const modelsMap = new Map();

export function resolveModels(modelsDir) {
	const vanillaModules = importModules(modelsDir);

	Object.keys(vanillaModules).forEach((key) => {
		let Model = vanillaModules[key];
		Model = Model.default || Model;

		const { name, keyName } = Model;

		const uniqueKey = lowerFirst(keyName || name || key);
		modelsMap.set(uniqueKey, Model);
	});

	return modelsMap;
}

export function createModels(modelsMap) {
	for (const [uniqueKey, Model] of modelsMap) {
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
	const { size } = modelsMap;
	logger.debug(`${size} model${size > 1 ? 's' : ''} created`);

	return models;
}

export function getModelKeys() {
	return [...modelsMap.keys()];
}

export function getModels() {
	return models;
}

export default createProxyObject(() => models, 'Models');
