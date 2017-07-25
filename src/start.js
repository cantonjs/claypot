
import { start as startPot, resolveConfig } from 'pot-js';
import { resolve } from 'path';
import { init, defaultConfigFilename } from './config';
import workspace from './utils/workspace';

export default async function start(options = {}) {
	const config = init(await resolveConfig({
		config: defaultConfigFilename,
		configWalk: true,
		...options,
		workspace,
		configToEnv: 'CLAYPOT_CONFIG',
		entry: resolve(__dirname, 'app.js'),
	}));

	await startPot(config);
}
