
import { argv } from './utils/args';
import { start, stop } from '.';

if (!argv._.length) {
	start().catch((err) => console.error(err));
}
else if (argv._[0] === 'stop') {
	stop().catch((err) => console.error(err));
}
