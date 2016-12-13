
import { argv } from './config/args';
import { monitorLogger } from './utils/logger';
import { start, stop, list, log } from '.';

const commands = argv._ || [];
const command = commands[0];

if (!command) {
	start().catch((err) => {
		console.error(err.message);
		monitorLogger.error(err);
	});
}
else if (command === 'stop') {
	stop().catch((err) => {
		console.error(err.message);
		monitorLogger.error(err);
	});
}
else if (command === 'ls') {
	list().catch((err) => {
		console.error(err, err.message);
		monitorLogger.error(err);
	});
}
else if (command === 'log') {
	log(argv).catch((err) => {
		console.error(err, err.message);
		monitorLogger.error(err);
	});
}
