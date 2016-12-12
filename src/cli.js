
import { argv } from './config/args';
import { monitorLogger } from './utils/logger';
import { start, stop } from '.';

if (!argv._.length) {
	start().catch((err) => {
		console.error(err.message);
		monitorLogger.error(err);
	});
}
else if (argv._[0] === 'stop') {
	stop().catch((err) => {
		console.error(err.message);
		monitorLogger.error(err);
	});
}
