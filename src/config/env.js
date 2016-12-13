
import { upperCase } from 'lodash';
import pkg from '../../package.json';

const { env } = process;

const {
	NODE_ENV = 'development',
} = env;

export const prefix = upperCase(pkg.name);

const getFullKey = (key) => `${prefix}_${upperCase(key)}`;

export const getEnv = (key, source = env) => {
	const fullKey = getFullKey(key);
	const val = source[fullKey];

	if (val === 'true') { return true; }
	else if (val === 'false' || (!val && +val !== 0)) { return false; }
	else if (val === 'undefined') { return; }
	else if (val === 'NaN') { return NaN; }
	else { return val; }
};

export const setEnv = (key, value, source = env) => {
	const fullKey = getFullKey(key);
	return source[fullKey] = value;
};

export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';
