
import { resolve } from 'path';
import { spawn, execSync } from 'child_process';
import EventEmitter from 'events';
import stripAnsi from 'strip-ansi';

let child;
const command = resolve('bin/claypot');

export const start = (args, options) => {
	const proc = new EventEmitter();

	child = spawn(
		command,
		// ['--execCommand=babel-register', ...args],
		args,
		{
			// stdio: 'inherit',
			...options,
		},
	);

	child.stdout.setEncoding('utf8');
	child.stderr.setEncoding('utf8');
	child.stdin.setEncoding('utf8');

	child.stdout.on('data', (ansi) => {
		const message = stripAnsi(ansi).trim();
		if (message.startsWith('ERROR')) {
			child.stdout.removeAllListeners('data');
			proc.emit('error', new Error(message));
		}
		else {
			proc.emit('data', { message, ansi });
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
