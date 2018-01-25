import { join } from 'path';
import { createLogger } from 'pot-logger';
import importModules from '../utils/importModules';
import createProxyObject from '../utils/createProxyObject';
import { lowerFirst, upperFirst } from 'lodash';

const logger = createLogger('schemas', 'cyanBright');
const schemas = {};

export function resolveSchemas({ baseDir, schemas: schemasDir }) {
	const schemasMap = new Map();
	const dir = join(baseDir, schemasDir);
	const vanillaModules = importModules(dir);

	Object.keys(vanillaModules).forEach((key) => {
		let creator = vanillaModules[key];
		creator = creator.default || creator;
		const name = lowerFirst(creator.keyName || creator.name || key);
		logger.trace(`"${name}" resolved`);
		schemasMap.set(name, creator);
	});

	return schemasMap;
}

export function createSchemas(schemasMap) {
	for (const [name, creator] of schemasMap) {
		const value = creator();
		const uppperName = upperFirst(name);
		Object.defineProperty(schemas, name, { value, enumerable: true });
		Object.defineProperty(schemas, uppperName, { value });
	}
	const { size } = schemasMap;
	logger.debug(`${size} schema${size > 1 ? 's' : ''} created`);
	return schemas;
}

export function getSchemas() {
	return schemas;
}

export default createProxyObject(schemas, 'Schema');
