
import { resolve } from 'path';
import { execSync } from 'child_process';
import Kapok from 'kapok-js';

let kapok;
const command = resolve('bin/claypot');

export const start = (args, options) => {
	kapok = new Kapok(
		command,
		['--execCommand=babel-register', ...args],
		// args,
		{
			// stdio: 'inherit',
			...options,
		},
	);
	return kapok;
};

export const stop = (done) => {
	try {
		console.log('kill');
		execSync(`${command} stop -f`);
		kapok.exit(done);
	}
	catch (err) {}
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('uncaughtException', stop);
