
import { resolve } from 'path';
import { execSync } from 'child_process';
import Kapok from 'kapok-js';
import { uniqueId } from 'lodash';

const kapoks = {};

export const command = resolve('bin/claypot');

export const start = (args = [], options = {}) => {
	const {
		name = uniqueId('claypot_'),
		execOptions = {},
	} = options;

	const kapok = new Kapok(
		command,
		[
			'--execCommand=babel-node',
			'--no-configWalk',
			...args,
			`--name=${name}`,
		],
		{
			cwd: resolve('test'),
			...execOptions,
		},
	);
	kapoks[name] = kapok;
	return kapok;
};

export const stop = async () => {
	await Promise.all(Object.keys(kapoks).map((name) => {
		return new Promise((resolve) => {
			const kapok = kapoks[name];
			try {
				execSync(`${command} stop ${name} -f`);
				kapok.exit(resolve);
			}
			catch (err) {
				process.stdout.write('stop err');
			}
			Reflect.deleteProperty(kapoks, name);
		});
	}));
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('uncaughtException', stop);
