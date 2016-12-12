
import { writeFile, readFile, ensureDir, open, unlink } from 'fs-promise';
import { spawn } from 'child_process';
import processExists from 'process-exists';
import { monitorLogger } from '../utils/logger';
import { join } from 'path';
import { trim } from 'lodash';
import Ipcee from 'ipcee';
import { globalConfig } from '../config';
import { startClient, disconnect } from './unixDomainSocket';
import globby from 'globby';

const { pidDir, socketDir } = globalConfig;

const getPidFile = (name) => join(pidDir, `${name}.pid`);
const getSocket = (name) => join(socketDir, name);

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
		if (!isProcessExists) { await unlink(pidFile); }
		return isProcessExists && pid;
	}
	return false;
};

const getSockets = async () => {
	await ensureDir(socketDir);
	const names = await globby(['*'], { cwd: socketDir });
	const sockets = [];
	for (const name of names) {
		sockets.push(await startClient('monitor', name, getSocket(name)));
	}
	return sockets;
};

export const execCommand = async (command, ...args) => {
	const sockets = await getSockets();
	const runners = sockets.map((socket) => {
		return new Promise((resolve) => {
			const handler = (data) => {
				socket.off(command, handler);
				resolve(data);
				disconnect(socket.id);
			};
			socket.on(command, handler);
			socket.emit(command, ...args);
		});
	});
	return Promise.all(runners);
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
	const scriptFile = join(__dirname, '../../bin/monitor');
	const monitor = spawn(execPath, [scriptFile], {
		detached: daemon,
		stdio: ['ipc', stdOut, stdErr],
		cwd: rootDir,
	});

	const ipc = new Ipcee(monitor);

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
