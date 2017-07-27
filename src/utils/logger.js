
import log4js from 'log4js';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
import config from '../config';
import chalk from 'chalk';
import { isFunction } from 'lodash';

const HTTP = 'http';
const APP = 'app';
const DEFAULT = 'default';
const ERROR = 'error';

const getCategoriesConfig = (appenders, level) => {
	return Object
		.keys(appenders)
		.reduce((catetories, key) => {
			catetories[key] = {
				appenders: [key],
				level,
			};
			return catetories;
		}, {})
	;
};

let appenders = {};
let categories = {};
let hasRunInit = false;

export function inLogsDir(name) {
	const { logsDir } = config;
	return join(logsDir, `${name}.log`);
}

export const initLog = (customAppenders) => {
	try {
		const { logsDir, daemon, logLevel } = config;

		if (daemon) {
			ensureDirSync(logsDir);
			Object.assign(appenders, {
				[HTTP]: {
					type: 'dateFile',
					filename: inLogsDir('access'),
					pattern: '-dd.log',
					layout: {
						type: 'pattern',
						pattern: '[%d{ISO8601}] %m',
					},
				},
				[APP]: {
					type: 'file',
					filename: inLogsDir('app'),
					level: 'INFO',
					maxLogSize: 10485760, // 10MB
					backups: 3,
					compress: true,
				},
				[DEFAULT]: {
					type: 'logLevelFilter',
					level: 'ALL',
					appender: {
						type: 'file',
						filename: inLogsDir('all'),
						maxLogSize: 10485760, // 10MB
						backups: 3,
					},
				},
				[ERROR]: {
					type: 'logLevelFilter',
					level: 'ERROR',
					appender: {
						type: 'file',
						filename: inLogsDir('error'),
						maxLogSize: 10485760, // 10MB
						backups: 3,
					},
				},
			});
		}
		else {
			Object.assign(appenders, {
				[DEFAULT]: {
					type: 'console',
					layout: {
						type: 'pattern',
						pattern: '%[%p%] %m',
					},
				},
			});
		}

		if (customAppenders) { Object.assign(appenders, customAppenders); }

		categories = getCategoriesConfig(appenders, logLevel);
		log4js.configure({ appenders, categories });
		hasRunInit = true;
	}
	catch (err) {
		console.error(err);
		throw err;
	}
};

const lazyGetLogger = (category) => {
	let logger = null;
	return new Proxy({}, {
		get(target, key) {
			hasRunInit || initLog();
			logger || (logger = log4js.getLogger(category));
			return logger[key];
		}
	});
};

export function createLogger(category, style = 'dim', options) {
	const { daemon, logLevel } = config;

	const getStyledCategoryStr = () => {
		const pattern = '[%c]';
		const validatColor = (style) => {
			if (!isFunction(chalk[style])) {
				throw new Error(`category with style "${style}" is NOT support.`);
			}
		};

		if (Array.isArray(style)) {
			const getStyle = style.reduce((chalkChaining, color) => {
				validatColor(color);
				return chalkChaining[color].bind(chalkChaining);
			}, chalk);
			return getStyle(pattern);
		}
		else {
			validatColor(style);
			return chalk[style](pattern);
		}
	};

	appenders[category] = options || (daemon ? {
		type: 'file',
		filename: inLogsDir('app'),
		maxLogSize: 10485760, // 10MB
		backups: 0,
	} : {
		type: 'console',
		layout: {
			type: 'pattern',
			pattern: `%[%p%] ${getStyledCategoryStr()} %m`,
		},
	});

	if (hasRunInit) {
		categories[category] = {
			appenders: [category],
			level: logLevel,
		};

		log4js.configure({ appenders, categories });
		return log4js.getLogger(category);
	}
	else {
		return lazyGetLogger(category);
	}
}

export const httpLogger = lazyGetLogger(HTTP);
export const appLogger = lazyGetLogger(APP);
export default appLogger;
