
import { resolve } from 'path';
import { spawn, execSync } from 'child_process';
import EventEmitter from 'events';

let child;
const command = resolve('bin/claypot');

export const start = (args, options) => {
	const proc = new EventEmitter();

	child = spawn(
		command,
		['--execCommand=babel-register', ...args],
		// args,
		{
			// stdio: 'inherit',
			...options,
		},
	);

	child.stdout.setEncoding('utf8');
	child.stderr.setEncoding('utf8');
	child.stdin.setEncoding('utf8');

	child.stdout.on('data', (data) => {
		data = data.trim();

		if (JSON.stringify(data).includes('ERROR')) {
			child.stdout.removeAllListeners('data');
			proc.emit('error', data);
		}
		else {
			proc.emit('data', data);
		}
	});

	proc.child = child;

	return proc;
};

export const stop = (done) => {
	try {
		console.log('kill');
		execSync(`${command} stop -f`);
		child.on('exit', done);
		child.kill('SIGTERM');
	}
	catch (err) {}
};
