
import { start as startPot, resolveConfig } from 'pot-js';
import { resolve } from 'path';
import { init } from './config';
import workspace from './utils/workspace';

export default async function start(options = {}) {
	const config = init(await resolveConfig({
		config: 'Claypotfile.js',
		configWalk: true,
		...options,
		workspace,
		entry: resolve(__dirname, 'app/index.js'),
		inject: true,
		stdio: ['ipc', 'inherit', 'inherit'],
	}));

	await startPot(config);
}
