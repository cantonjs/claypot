
import log4js from 'log4js';
import { ensureDirSync } from 'fs-promise';
import { resolve } from 'path';
import config from '../config';

const HTTP = 'http';
const APP = 'app';
const MONITOR = 'monitor';

const baseDir = resolve('.logs');
const inDir = (name) => resolve(baseDir, `${name}.log`);

let appenders;

if (config.daemon) {
	ensureDirSync(baseDir);
	appenders = [
		{
			type: 'dateFile',
			filename: inDir('access'),
			pattern: '-dd.log',
			category: HTTP,
			layout: {
				type: 'pattern',
				pattern: '[%d{ISO8601}] %m',
			},
		},
		{
			type: 'file',
			filename: inDir('app'),
			level: 'INFO',
			maxLogSize: 10485760, // 10MB
			backups: 3,
			compress: true,
			category: APP,
		},
		{
			type: 'logLevelFilter',
			level: 'ERROR',
			appender: {
				type: 'file',
				filename: inDir('error'),
				maxLogSize: 10485760, // 10MB
				backups: 3,
			},
		},
		{
			type: 'file',
			filename: inDir('monitor'),
			maxLogSize: 10485760, // 10MB
			category: MONITOR,
		},
	];
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

export default log4js;

export const httpLogger = log4js.getLogger(HTTP);
export const appLogger = log4js.getLogger(APP);
export const monitorLogger = log4js.getLogger(MONITOR);
