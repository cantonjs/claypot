
import { writeFile, readFile, open, unlink } from 'fs-promise';
import { spawn } from 'child_process';
import { monitorLogger } from '../utils/logger';
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
	catch (err) { monitorLogger.debug(err); }

	try { process.kill(pid); }
	catch (err) { monitorLogger.debug(err); }
};

export const startMonitor = async (script, { daemon, ...options }) => {
	const { rootDir, name } = options;

	const pidFile = getPidFile(rootDir, name);

	const isExists = await checkIsPidFileExists(pidFile, name);

	if (isExists) {
		throw new Error(`"${name}" is running.`);
	}

	const stdOut = daemon ? 'ignore' : 'inherit';
	const stdErr = daemon ? 'ignore' : 'inherit';
	const { execPath } = process;
	const scriptFile = resolve(__dirname, '../../bin/monitor');
	const monitor = spawn(execPath, [scriptFile], {
		detached: daemon,
		stdio: ['ipc', stdOut, stdErr],
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
