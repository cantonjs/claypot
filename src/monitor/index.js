
import { writeFile, readFile, open, unlink } from 'fs-promise';
import { spawn } from 'child_process';
import { resolve } from 'path';
import IPC from '../utils/IPC';

const getPidFile = (rootDir, name) => resolve(rootDir, `${name}.pid`);

const writePidFile = async (pidFile, pid) => {
	await writeFile(pidFile, pid);
};

const checkIsPidFileExists = async (pidFile) => {
	try { return !!await open(pidFile, 'r'); }
	catch (err) { return false; }
};

export const stopMonitor = async ({ rootDir, name }) => {
	const pidFile = getPidFile(rootDir, name);

	const isExists = await checkIsPidFileExists(pidFile, name);

	if (!isExists) {
		throw new Error(`"${name}" not found.`);
	}

	const pid = await readFile(pidFile, 'utf-8');

	try { await unlink(pidFile); }
	catch (err) { /* noop */ }

	try { process.kill(pid); }
	catch (err) { /* noop */ }
};

export const startMonitor = async (script, { daemon, ...options }) => {
	const { rootDir, name } = options;

	const pidFile = getPidFile(rootDir, name);

	const isExists = await checkIsPidFileExists(pidFile, name);

	if (isExists) {
		throw new Error(`"${name}" is running.`);
	}

	const { execPath } = process;
	const monitor = spawn(execPath, [resolve('bin/monitor')], {
		detached: daemon,
		stdio: ['ipc', 'inherit', 'inherit'],
	});

	const ipc = new IPC(monitor);

	ipc
		.on('pid', async (pid) => {
			if (daemon) {
				await writePidFile(pidFile, pid);
			}
		})
		.on('start', () => {
			monitor.emit('start');

			if (daemon) {
				monitor.disconnect();
				monitor.unref();
			}
		})
		.send('start', { script, options: { pidFile, ...options } })
	;

	return monitor;
};
