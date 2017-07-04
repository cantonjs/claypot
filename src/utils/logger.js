
import log4js from 'log4js';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
import config from '../config';
import { noop } from 'lodash';

const HTTP = 'http';
const APP = 'app';

export const initLog = (addAppenders = noop) => {

	const { logsDir, daemon } = config;
	const inLogsDir = (name) => join(logsDir, `${name}.log`);

	let appenders;

	if (daemon) {
		ensureDirSync(logsDir);
		appenders = [
			{
				type: 'dateFile',
				filename: inLogsDir('access'),
				pattern: '-dd.log',
				category: HTTP,
				layout: {
					type: 'pattern',
					pattern: '[%d{ISO8601}] %m',
				},
			},
			{
				type: 'file',
				filename: inLogsDir('app'),
				level: 'INFO',
				maxLogSize: 104857600, // 100MB
				backups: 3,
				compress: true,
				category: APP,
			},
			{
				type: 'logLevelFilter',
				level: 'ALL',
				appender: {
					type: 'file',
					filename: inLogsDir('all'),
					maxLogSize: 104857600, // 100MB
					backups: 3,
				},
			},
			{
				type: 'logLevelFilter',
				level: 'ERROR',
				appender: {
					type: 'file',
					filename: inLogsDir('error'),
					maxLogSize: 104857600, // 100MB
					backups: 3,
				},
			},
		];
		appenders = appenders.concat(addAppenders({ inLogsDir }) || []);
	}
	else {
		appenders = [{ type: 'console' }];
	}

	log4js.configure({
		appenders,
		levels: {
			'[all]': 'INFO',
		},
	});
};

const getDefaultLogger = (category) => [
	'setLevel', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
].reduce(
	(logger, method) => Object.assign(logger, { [method]: noop }),
	{ category },
);

let hasInit = false;

const proxy = (logger) => {
	let finalLogger;

	return new Proxy(logger, {
		get(target, key) {
			if (!hasInit) {
				initLog();
				hasInit = true;
			}

			if (finalLogger) { return finalLogger[key]; }

			finalLogger = log4js.getLogger(target.category);
			finalLogger.setLevel(config.logLevel);

			return finalLogger[key];
		}
	});
};

const originHttpLogger = getDefaultLogger(HTTP);
const originAppLogger = getDefaultLogger(APP);

export const httpLogger = proxy(originHttpLogger);
export const appLogger = proxy(originAppLogger);
export default appLogger;
