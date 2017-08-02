
import { start as startPot } from 'pot-js';
import { resolve } from 'path';
import { initConfig, initCliConfig } from './config';
import workspace from './utils/workspace';

const startClaypot = async (config) => {
	await startPot({
		...config,
		workspace,
		configToEnv: 'CLAYPOT_CONFIG',
		entry: resolve(__dirname, 'app.js'),
	});
};

export async function cliStart(argv) {
	const cliConfig = await initCliConfig(argv);
	await startClaypot(cliConfig);
}

export default async function start(config) {
	await startClaypot(initConfig(config));
}
