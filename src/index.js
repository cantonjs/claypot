
import config, { isDev } from './config';
import exec from './utils/exec';
import { monitorLogger } from './utils/logger';
import { join } from 'path';
import outputHost from 'output-host';
import { startMonitor, stopMonitor, execAll, execByName } from './monitor';
import Table from 'cli-table';
import sliceFile from 'slice-file';
import chalk from 'chalk';

const procs = [];

const bootstrap = () => new Promise(async (resolve, reject) => {
	const {
		script: { command }, ...options,
	} = config;

	const serverFile = join(__dirname, 'app.js');

	try {
		const proc = await startMonitor([command, serverFile], options);

		proc
			.on('start', () => {
				monitorLogger.debug('proc start');
				resolve(proc);
			})
			.on('exit', (...args) => {
				monitorLogger.info('exit', args);
			})
		;
	}
	catch (err) {
		reject(err);
	}
});

export const start = async () => {
	const { script: { pre, post }, port } = config;

	pre && await procs.push(exec(pre));

	procs.push(await bootstrap());

	post && await procs.push(exec(post));

	isDev && outputHost(port);
};

export const stop = () => stopMonitor(config);

export const list = async () => {
	const infoList = await execAll('info');

	if (!infoList.length) {
		return console.log('No process.');
	}

	const table = new Table({
		head: [
			'Name', 'Status', 'Crashes', 'Memory', 'Started', 'Pid', 'Port',
		],
		style: {
			head: ['blue'],
		}
	});

	infoList.filter(Boolean).forEach((info) => {
		const { status, memoryUsage } = info;
		const { heapUsed, heapTotal, formattedHeapUsed } = memoryUsage;
		const memoryPercent = `${(heapUsed / heapTotal / 100).toFixed(2)}%`;
		const memory = `${formattedHeapUsed} (${memoryPercent})`;
		const styledStatus = (function () {
			switch (status) {
				case 'running':
					return chalk.green(status);
				case 'stopped':
				case 'crashed':
					return chalk.red(status);
				case 'sleeping':
					return chalk.magenta(status);
				default:
					return status;
			}
		}());
		table.push([
			info.name,
			styledStatus,
			info.crashes,
			memory,
			info.started,
			info.pid,
			info.data.port,
		]);
	});

	console.log(table.toString());
};

export const log = async ({ name, line, category, follow }) => {
	const info = await execByName(name, 'info');
	if (!info || !info.data) {
		throw new Error(`"${name}" is NOT found.`);
	}

	const { logsDir } = info.data;
	const logFile = join(logsDir, `${category}.log`);
	const sf = sliceFile(logFile);
	const mode = follow ? 'follow' : 'slice';
	sf.on('error', (err) => {
		if (err.code !== 'ENOENT') { throw err; }
		console.log('Log file NOT found.');
	});
	sf[mode](-line).pipe(process.stdout);
};
