
import applyDefaults from './defaults';
import strip from './strip';
import validate from './validate';

const config = {};

export const isProd = process.env === 'production';
export const isDev = !isProd;

export function initConfig(userConfig) {
	applyDefaults(config, userConfig, isProd);
	strip(config);
	validate(config);
	return config;
}

export function initAppConfig(configString) {
	return Object.assign(config, JSON.parse(configString));
}

export default config;
