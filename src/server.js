// server process

import { initProcessConfig } from './config';
import { ensureLogger } from 'pot-logger';
import chalk from 'chalk';
import boot from './boot';

const serverLogger = ensureLogger('server', 'yellow');

(async function server() {
	try {
		const config = initProcessConfig(process.env.CLAYPOT_CONFIG);
		const { host, port } = config;

		host && serverLogger.trace('HTTP host', chalk.magenta(host));
		serverLogger.trace('HTTP port', chalk.magenta(port));

		await boot(config);

		serverLogger.info(chalk.green('ready'));
	}
	catch (err) {
		serverLogger.fatal('failed to start server:', err);
	}
})();
