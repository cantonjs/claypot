import importModules from 'import-modules';
import { join } from 'path';
import { forEach, isFunction, lowerFirst, lowerCase, upperFirst } from 'lodash';
import { createLogger } from 'pot-logger';
import createProxyObject from '../utils/createProxyObject';

const logger = createLogger('model', 'blueBright');
const models = {};
const modules = new Map();
const keys = new Map();
const uniqueKeys = new Set();

export async function initModels(dbs, appConfig) {
	const { models: modelsDir, baseDir } = appConfig;
	const vanillaModules = importModules(join(baseDir, modelsDir));

	forEach(vanillaModules, (module, key) => {
		module = module.default || module;

		const { name, keyName } = module;

		const uniqueKey = keyName || name || key;
		modules.set(uniqueKey, module);
		uniqueKeys.add(uniqueKey);

		const lowerFirstKey = lowerFirst(key);
		const lowerCaseKey = lowerCase(key);
		const upperFirstKey = upperFirst(key);
		if (!keys.has(key)) {
			keys.set(key, uniqueKey);
		}
		if (!keys.has(lowerFirstKey)) {
			keys.set(lowerFirstKey, uniqueKey);
		}
		if (!keys.has(lowerCaseKey)) {
			keys.set(lowerCaseKey, uniqueKey);
		}
		if (!keys.has(upperFirstKey)) {
			keys.set(upperFirstKey, uniqueKey);
		}

		if (name) {
			const lowerFirstName = lowerFirst(name);
			const lowerCaseName = lowerCase(name);
			const upperFirstName = upperFirst(name);
			if (!keys.has(name)) {
				keys.set(name, uniqueKey);
			}
			if (!keys.has(lowerFirstName)) {
				keys.set(lowerFirstName, uniqueKey);
			}
			if (!keys.has(lowerCaseName)) {
				keys.set(lowerCaseName, uniqueKey);
			}
			if (!keys.has(upperFirstName)) {
				keys.set(upperFirstName, uniqueKey);
			}
		}
	});

	const extendModel = (Model, key, extension) => {
		if (!Model) {
			return;
		}
		const prop = `$${key}`;
		Model[prop] = extension;
		if (isFunction(Model)) {
			Model.prototype[prop] = extension;
		}
		return Model;
	};

	const modelKeys = Array.from(keys.keys());

	dbs.forEach(({ dbKey, createModels, options }) => {
		const extensions = createModels(modelKeys, dbKey, options);
		forEach(extensions, (extension, key) => {
			const uniqueKey = keys.get(key);
			extendModel(modules.get(uniqueKey), dbKey, extension);
		});
	});

	uniqueKeys.forEach((uniqueKey) => {
		const Model = extendModel(modules.get(uniqueKey), 'models', models);
		if (Model) {
			models[uniqueKey] = isFunction(Model) ? new Model() : Model;
			logger.trace(`"${uniqueKey}" created`);
		}
	});

	logger.debug(
		`${uniqueKeys.size} model${uniqueKeys.size > 1 ? 's' : ''} created`,
	);

	modules.clear();
	keys.clear();
}

export function getModelKeys() {
	return uniqueKeys;
}

export function getModels() {
	return models;
}

export default createProxyObject(models, 'Models');
