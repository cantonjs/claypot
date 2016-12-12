
import { argv } from './config/args';
import { monitorLogger } from './utils/logger';
import { start, stop, list } from '.';

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
	list();
}
