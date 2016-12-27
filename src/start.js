
import { start as startPot, resolveConfig } from 'pot-js';
import { resolve } from 'path';
import { init, isDev } from './config';
import workspace from './utils/workspace';
import { appLogger } from './utils/logger';
import outputHost from 'output-host';

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

	outputHost({
		name: config.name,
		useCopy: isDev,
		logger: appLogger.info.bind(appLogger),
	});
}
