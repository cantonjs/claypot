
import { start as startPot, resolveConfig } from 'pot-js';
import { resolve } from 'path';
import { init, defaultConfigFilename } from './config';
import workspace from './utils/workspace';
import { stripConfigArgs } from './utils/stripArgs';
import validateConfig from './utils/validateConfig';

export default async function start(options = {}) {
	const config = init(await resolveConfig(options));

	stripConfigArgs(options);
	validateConfig(options);

	await startPot({
		config: defaultConfigFilename,
		configWalk: true,
		...config,
		workspace,
		configToEnv: 'CLAYPOT_CONFIG',
		entry: resolve(__dirname, 'app.js'),
	});
}
