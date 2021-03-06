// server process

import { initProcessConfig } from './config';
import { createLogger } from 'pot-logger';
import chalk from 'chalk';
import startServer from './startServer';

const serverLogger = createLogger('server', 'yellow');

(async function server() {
	try {
		const config = initProcessConfig(process.env.CLAYPOT_CONFIG);
		const { host, port } = config;

		host && serverLogger.trace('HTTP host', chalk.magenta(host));
		serverLogger.trace('HTTP port', chalk.magenta(port));

		await startServer(config);

		serverLogger.info(chalk.green('ready'));
	}
	catch (err) {
		serverLogger.fatal('failed to start server:', err);
	}
})();
