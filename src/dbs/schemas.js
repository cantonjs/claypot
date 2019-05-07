import { ensureLogger } from 'pot-logger';
import importModules from '../utils/importModules';
import createProxyObject from '../utils/createProxyObject';
import { lowerFirst, upperFirst } from 'lodash';

const logger = ensureLogger('schemas', 'cyanBright');
const schemas = {};

export function resolveSchemas(schemasDir) {
	const vanillaModules = importModules(schemasDir);
	let size = 0;

	Object.keys(vanillaModules).forEach((key) => {
		const value = vanillaModules[key];
		const name = lowerFirst(value.keyName || key);
		const uppperName = upperFirst(name);
		logger.trace(`"${name}" resolved`);
		Object.defineProperty(schemas, name, { value, enumerable: true });
		Object.defineProperty(schemas, uppperName, { value });
		size++;
	});

	logger.debug(`${size} schema${size > 1 ? 's' : ''} resolved`);
	return schemas;
}

export function getSchemas() {
	return schemas;
}

export default createProxyObject(() => schemas, 'Schema');
