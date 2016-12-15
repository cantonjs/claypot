
import { writeFile, readFile, ensureDir, open, unlink } from 'fs-promise';
import { spawn } from 'child_process';
import processExists from 'process-exists';
import { monitorLogger } from '../utils/logger';
import { join } from 'path';
import { trim } from 'lodash';
import ChildIPC from '../utils/ChildIPC';
import { globalConfig } from '../config';
import { startClient, disconnect } from './unixDomainSocket';
import globby from 'globby';

const { pidDir, socketDir } = globalConfig;

const getPidFile = (name) => join(pidDir, `${name}.pid`);
const getSocketPath = (name) => join(socketDir, name);

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

const getNames = async () => {
	await ensureDir(socketDir);
	return await globby(['*'], { cwd: socketDir });
};

const findSocketByName = async (name) => {
	const names = await getNames();
	for (const iteratorName of names) {
		if (iteratorName === name) {
			return await startClient('monitor', name, getSocketPath(name));
		}
	}
};

const getSockets = async () => {
	const names = await getNames();
	const sockets = [];
	for (const name of names) {
		sockets.push(await startClient('monitor', name, getSocketPath(name)));
	}
	return sockets.filter(Boolean);
};

const execCommand = (socket, command, arg) => new Promise((resolve) => {
	const handler = (data) => {
		socket.off(command, handler);
		resolve(data);
		disconnect(socket.id);
	};
	socket.on(command, handler);
	socket.emit(command, arg);
});

export const execByName = async (name, command, arg) => {
	const socket = await findSocketByName(name);
	if (!socket) { return; }
	return await execCommand(socket, command, arg);
};

export const execAll = async (command, arg) => {
	const sockets = await getSockets();
	const runners = sockets.map((socket) =>
		execCommand(socket, command, arg)
	);
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

	const ipc = new ChildIPC(monitor);

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

	process.on('uncaughtException', async (err) => {
		monitorLogger.debug('uncaughtException', err);
		await stopMonitor(options);
		process.exit(1);
	});

	return monitor;
};
