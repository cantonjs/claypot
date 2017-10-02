
import applyDefaults from './defaults';
import importConfigFile from './importConfigFile';
import validate from './validate';
import stripArgs from './stripArgs';
import logger from 'pot-logger';
import { defaults } from 'lodash';

const config = {};

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = !isDev;

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

	let claypotFileConfig = {};

	try {
		claypotFileConfig = await importConfigFile(
			configFile || defaultConfigFile,
			configWalk,
		);
	}
	catch (err) {
		configFile && logger.error(err);
	}

	stripArgs(restArgs);

	const isProduction = !!(
		restArgs.production !== undefined ? restArgs.production :
			(claypotFileConfig.production !== undefined ?
				claypotFileConfig.production : isProd
			)
		)
	;

	applyDefaults(config, defaults(restArgs, claypotFileConfig), isProduction);
	validate(config);

	return {
		...config,
		force,
	};
}

export function initAppConfig(configString) {
	return Object.assign(config, JSON.parse(configString));
}

export default config;
