import { join } from 'path';
import { createLogger } from 'pot-logger';
import importModules from '../utils/importModules';
import createProxyObject from '../utils/createProxyObject';
import { lowerFirst, upperFirst } from 'lodash';

const logger = createLogger('schemas', 'cyanBright');
const schemas = {};

export function resolveSchemas({ baseDir, schemas: schemasDir }) {
	const dir = join(baseDir, schemasDir);
	const vanillaModules = importModules(dir);
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

export default createProxyObject(schemas, 'Schema');
