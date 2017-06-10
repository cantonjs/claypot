
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
		entry: resolve(__dirname, 'app.js'),
		inject: true,
		stdio: ['ipc', 'pipe', 'pipe'],
	}));

	await startPot(config);

	const enableHttps = config.ssl.enable;

	const logger = appLogger.info.bind(appLogger);

	outputHost({
		port: config.port,
		name: config.name,
		useCopy: isDev && !enableHttps,
		logger,
	});

	if (enableHttps) {
		outputHost({
			port: config.ssl.port,
			name: `${config.name} HTTPS`,
			protocol: 'https',
			useCopy: isDev,
			logger,
		});

	}
}
