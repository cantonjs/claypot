
import { start as startPot } from 'pot-js';
import { resolve } from 'path';
import { initConfig, stripArgs } from './config';
import workspace from './utils/workspace';
import { importConfigFile, defaultConfigFile } from './utils/importConfigFile';
import { defaults } from 'lodash';
import logger from 'pot-logger';

const startClaypot = async (config) => {
	await startPot({
		...config,
		workspace,
		configToEnv: 'CLAYPOT_CONFIG',
		entry: resolve(__dirname, 'app.js'),
	});
};

export async function cliStart(argv) {
	const {
		force, configFile, configWalk,
		...restArgs,
	} = argv;

	let config = {};

	try {
		config = await importConfigFile(
			configFile || defaultConfigFile,
			configWalk,
		);
	}
	catch (err) {
		configFile && logger.error(err);
	}

	stripArgs(restArgs);

	await startClaypot({
		...defaults(restArgs, initConfig(config)),
		force,
	});
}

export default async function start(config) {
	await startClaypot(initConfig(config));
}
