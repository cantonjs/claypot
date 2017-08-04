
import { start as startPot } from 'pot-js';
import { resolve } from 'path';
import { initConfig, initCliConfig } from './config';
import workspace from './utils/workspace';
import outputHost from 'output-host';
import logger from 'pot-logger';

const startClaypot = async (config) => {
	await startPot({
		...config,
		root: config.cwd,
		workspace,
		configToEnv: 'CLAYPOT_CONFIG',
		entry: resolve(__dirname, 'app.js'),
	});

	if (config.outputHost && config.outputHost.enable) {
		outputHost({
			...config.outputHost,
			logger: logger.debug,
		});
	}
};

export async function cliStart(argv) {
	const cliConfig = await initCliConfig(argv);
	await startClaypot(cliConfig);
}

export default async function start(config) {
	await startClaypot(initConfig(config));
}
