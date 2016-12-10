
import childProcess from 'child_process';
import { resolve } from 'path';
import IPC from './utils/IPC';

const { exec, spawn } = childProcess;

export const start = function start(script, { daemon, ...options }) {
	const { execPath } = process;
	const monitor = spawn(execPath, [resolve('bin/monitor')], {
		detached: daemon,
		stdio: ['ipc', 'inherit', 'inherit'],
	});

	const ipc = new IPC(monitor);

	ipc
		.on('pid', (pid) => console.log('pid', pid))
		.on('start', () => {
			monitor.emit('start');

			console.log('typeof monitor.connect', typeof monitor.connect);
			console.log('monitor.channel', monitor.channel);

			if (daemon) {
				monitor.unref();
			}
		})
		.send('start', { script, options })
	;

	return monitor;
};
