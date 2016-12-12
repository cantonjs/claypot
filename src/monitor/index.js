
import { writeFile, readFile, ensureDir, open, unlink } from 'fs-promise';
import { spawn } from 'child_process';
import processExists from 'process-exists';
import { monitorLogger } from '../utils/logger';
import { resolve } from 'path';
import { trim } from 'lodash';
import IPC from '../utils/IPC';
import configStore from '../config/store';

const pidDir = configStore.get('pidDir');

const getPidFile = (name) => resolve(pidDir, `${name}.pid`);

const writePidFile = async (pidFile, pid) => {
	await ensureDir(pidDir);
	await writeFile(pidFile, pid);
};

const checkIsPidFileExists = async (pidFile) => {
	try { return !!await open(pidFile, 'r'); }
	catch (err) { return false; }
};

const getPid = async (pidFile) => {
	const isFileExists = await checkIsPidFileExists(pidFile);
	if (isFileExists) {
		const pid = +trim(await readFile(pidFile, 'utf-8'));
		const isProcessExists = await processExists(pid);
		return isProcessExists && pid;
	}
	return false;
};

export const stopMonitor = async ({ name }) => {
	const pidFile = getPidFile(name);

	const pid = await getPid(pidFile);

	if (!pid) {
		throw new Error(`"${name}" not found.`);
	}

	try { await unlink(pidFile); }
	catch (err) { monitorLogger.debug(err); }

	try { process.kill(pid); }
	catch (err) { monitorLogger.debug(err); }
};

export const startMonitor = async (script, { daemon, ...options }) => {
	const { rootDir, name } = options;

	const pidFile = getPidFile(name);

	const isExists = !!await getPid(pidFile, name);

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
		cwd: rootDir,
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
