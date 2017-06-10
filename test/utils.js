
import { resolve } from 'path';
import { execSync } from 'child_process';
import Kapok from 'kapok-js';

const kapoks = [];

export const command = resolve('bin/claypot');

export const start = (args, options, name = 'claypot') => {
	const kapok = new Kapok(
		command,
		['--execCommand=babel-register', ...args, '--name', name],
		options,
	);
	kapoks.push({ name, kapok });
	return kapok;
};

export const stop = async () => {
	try {
		const promises = [];

		while (kapoks.length) {
			const { kapok, name } = kapoks.shift();
			promises.push(new Promise((resolve) => {
				execSync(`${command} stop ${name} -f`);
				kapok.exit(resolve);
			}));
		}

		return Promise.all(promises);
	}
	catch (err) {}
};

export function delay(t = 1000) {
	return new Promise((resolve) => {
		setTimeout(resolve, t);
	});
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('uncaughtException', stop);
