
import applyDefaults from './defaults';
import validate from './validate';

export stripArgs from './stripArgs';

const config = {};

export const isProd = process.env === 'production';
export const isDev = !isProd;

export function initConfig(userConfig) {
	applyDefaults(config, userConfig, isProd);
	validate(config);
	return config;
}

export function initAppConfig(configString) {
	return Object.assign(config, JSON.parse(configString));
}

export default config;
