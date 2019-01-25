import { resolve } from 'path';
import { execSync } from 'child_process';
import Kapok from 'kapok-js';

export const command = resolve('bin/claypot');

export const start = (args = [], options) => {
	return Kapok.start(
		command,
		['--execCommand=babel-node', '--no-configWalk', ...args],
		{
			cwd: resolve('test'),
			...options,
		},
	);
};

export const stop = async () => {
	try {
		execSync(`cross-env CLAYPOT_DEV=true ${command} stop -f`);
		await Kapok.killAll();
	}
	catch (err) {
		process.stdout.write('stop err');
	}
};
