
import yargs from 'yargs';
import { name, version } from '../package.json';
import { upperCase } from 'lodash';
import { appLogger } from './utils/logger';
import { Defaults } from 'pot-js/lib/utils/resolveConfig';
import { resolveConfig } from 'pot-js';
import start from './start';
import stop from './stop';
import list from './list';
import log from './log';
import dir from './dir';

// eslint-disable-next-line
yargs
	.usage('$0 <command> [args]')
	.demand(1, 'Please specify one of the commands!')
	.command({
		command: 'start',
		desc: 'Start claypot server',
		builder(yargs) {
			yargs // eslint-disable-line
				.default('entry', Defaults.ENTRY)
				.options({
					name: {
						desc: 'Server name',
						type: 'string',
					},
					s: {
						alias: 'static',
						desc: 'Static files dir',
						default: 'static',
						type: 'string',
					},
					d: {
						alias: 'daemon',
						desc: 'Use as a daemon',
						default: false,
						type: 'bool',
					},
					p: {
						alias: 'production',
						desc: 'Short hand for set NODE_ENV="production" env',
						default: false,
						type: 'bool',
					},
					l: {
						alias: 'log-level',
						desc: 'Log level',
						choices: [
							'ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF',
						],
						default: Defaults.LOG_LEVEL,
					},
					w: {
						alias: 'watch',
						desc: 'Enable watch mode',
						default: Defaults.WATCH,
						type: 'bool',
					},
					'watch-dirs': {
						desc: 'Watch dirs',
						default: Defaults.WATCH_DIRS,
						type: 'array',
					},
					'watch-ignore-dot-files': {
						desc: 'Ignore watch dot files',
						default: Defaults.WATCH_IGNORE_DOT_FILES,
						type: 'bool',
					},
					f: {
						alias: 'force',
						desc: 'Force restart even if the process is exists',
						type: 'bool',
					},
					c: {
						alias: 'config',
						desc: 'Path to the config file',
						default: 'Claypotfile.js',
						type: 'string',
					},
					'config-walk': {
						desc: 'Walk to resolve config file',
						default: true,
						type: 'bool',
					},
					root: {
						desc: 'Root dir. Defaults to `process.cwd()`',
						type: 'string',
					},
					'logs-dir': {
						desc: 'Log files dir. Resolve from `root`',
						default: Defaults.LOGS_DIR,
						type: 'string',
					},
					port: {
						desc: 'Server port',
						type: 'number',
					},
					'max-restarts': {
						desc: 'How many restarts are allowed within 60s. `-1` for infinite restarts. If `production` is `true`, default value is `-1`, otherwise is `0`',
						type: 'number',
					},
					inspect: {
						desc: 'Activate inspector. Require Node.js >= v6.3.0',
						type: 'string',
					},
				})
				.argv
			;
		},
		async handler(argv) {
			const {
				watch, watchDirs, watchIgnoreDotFiles, feature, ...options,
			} = argv;

			options.watch = {
				enable: watch,
				dirs: watchDirs,
				ignoreDotFiles: watchIgnoreDotFiles,
			};

			try {
				await start(await resolveConfig(options));
			}
			catch (err) {
				appLogger.setLevel(options.logLevel);
				appLogger.error(err.message);
				appLogger.debug(err);
			}
		},
	})
	.command({
		command: 'stop [name]',
		desc: 'Stop process',
		builder(yargs) {
			yargs // eslint-disable-line
				.options({
					f: {
						alias: 'force',
						desc: 'Stop without confirming',
						type: 'bool',
					},
					l: {
						alias: 'log-level',
						desc: 'Log level',
						choices: [
							'ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF',
						],
						default: Defaults.LOG_LEVEL,
					},
				})
				.argv
			;
		},
		handler(argv) {
			stop(argv).catch((err) => appLogger.error(err.message));
		},
	})
	.command({
		command: 'list',
		aliases: ['ls'],
		desc: 'List processes',
		handler(argv) {
			list(argv).catch((err) => appLogger.error(err.message));
		},
	})
	.command({
		command: 'log [name]',
		desc: 'Show log',
		builder(yargs) {
			yargs // eslint-disable-line
				.options({
					c: {
						alias: 'category',
						desc: 'Log category',
						type: 'string',
					},
					f: {
						alias: 'follow',
						desc: 'Follow mode. Just like `trail -f`',
						type: 'bool',
					},
					n: {
						alias: 'line',
						desc: 'Max lines.',
						type: 'number',
						default: 200,
					},
				})
				.argv
			;
		},
		handler(argv) {
			log(argv).catch((err) => appLogger.error(err.message));
		},
	})
	.command({
		command: 'dir [name]',
		desc: 'Show dir',
		handler(argv) {
			dir(argv).catch((err) => appLogger.error(err.message));
		},
	})
	.env(upperCase(name))
	.alias('h', 'help')
	.wrap(yargs.terminalWidth())
	.help()
	.version(version)
	.argv
;
