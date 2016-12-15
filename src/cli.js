
import { argv } from './config/args';
import logger from './utils/cliLogger';
import { start, stop, list, log } from '.';

const commands = argv._ || [];
const command = commands[0];

if (!command) {
	start().catch((err) => {
		logger.error(err.message);
	});
}
else if (command === 'stop') {
	stop().catch((err) => {
		logger.error(err.message);
	});
}
else if (command === 'ls') {
	list().catch((err) => {
		logger.error(err.message);
	});
}
else if (command === 'log') {
	log(argv).catch((err) => {
		logger.error(err.message);
	});
}
