
import applyDefaults from './defaults';
import importConfigFile from './importConfigFile';
import validate from './validate';
import stripArgs from './stripArgs';
import logger from 'pot-logger';
import { defaults } from 'lodash';

const config = {};

export const isProd = process.env === 'production';
export const isDev = !isProd;

export const defaultConfigFile = 'Claypotfile.js';

export function initConfig(userConfig) {
	applyDefaults(config, userConfig, isProd);
	validate(config);
	return config;
}

export async function initCliConfig(argv) {
	const {
		force, configFile, configWalk,
		...restArgs,
	} = argv;

	let cliConfig = {};

	try {
		cliConfig = await importConfigFile(
			configFile || defaultConfigFile,
			configWalk,
		);
	}
	catch (err) {
		configFile && logger.error(err);
	}

	stripArgs(restArgs);

	return {
		...defaults(restArgs, initConfig(cliConfig)),
		force,
	};
}

export function initAppConfig(configString) {
	return Object.assign(config, JSON.parse(configString));
}

export default config;
