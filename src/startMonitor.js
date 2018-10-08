import { start as startPot } from 'pot-js';
import { resolve } from 'path';
import { initConfig, initCliConfig } from './config';
import workspace from './utils/workspace';
import outputHost from 'output-host';
import logger from 'pot-logger';

const startClaypotMonitor = async (config) => {
	await startPot({
		...config,
		workspace,
		configToEnv: 'CLAYPOT_CONFIG',
		entry: resolve(__dirname, 'server.js'),
		env: {
			NODE_ENV:
				(config.env && config.env.NODE_ENV) ||
				(config.production ? 'production' : 'development'),
			...config.env,
		},
	});

	if (config.outputHost && config.outputHost.enable) {
		outputHost({
			...config.outputHost,
			logger: logger.debug,
		});
	}
};

export async function cliStartMonitor(argv) {
	const cliConfig = await initCliConfig(argv);
	await startClaypotMonitor(cliConfig);
}

export default async function start(config) {
	await startClaypotMonitor(initConfig(config));
}
