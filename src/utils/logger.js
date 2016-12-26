
import log4js from 'log4js';
import { ensureDirSync } from 'fs-promise';
import { join } from 'path';
import config from '../config';
import { logger as potLogger } from 'pot-js';

const HTTP = 'http';
const APP = 'app';

const { logsDir, daemon } = config;
const inDir = (name) => join(logsDir, `${name}.log`);

let appenders;

if (daemon) {
	ensureDirSync(logsDir);
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
			level: 'ALL',
			appender: {
				type: 'file',
				filename: inDir('all'),
				maxLogSize: 10485760, // 10MB
				backups: 3,
			},
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

export { potLogger };
export const httpLogger = log4js.getLogger(HTTP);
export const appLogger = log4js.getLogger(APP);
export default log4js;
