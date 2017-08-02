
import yargs from 'yargs';
import { name, version } from '../package.json';
import { upperCase } from 'lodash';
import logger from 'pot-logger';
import { defaultConfigFile } from './config';
import { cliStart } from './start';
import stop from './stop';
import list from './list';
import log from './log';
import dir from './dir';
import gradient from 'gradient-string';

// eslint-disable-next-line
yargs
	.usage(`\n${gradient.fruit('claypot')} <command> [args]`)
	.demand(1, 'Please specify one of the commands!')
	.command({
		command: 'start',
		desc: 'Start claypot server',
		builder(yargs) {
			yargs // eslint-disable-line
				.options({
					name: {
						desc: 'Server name',
						type: 'string',
					},
					s: {
						alias: 'static',
						desc: 'Static files dir. Defaults to "static"',
						type: 'string',
					},
					d: {
						alias: 'daemon',
						desc: 'Use as a daemon. Defaults to `false`',
						type: 'bool',
					},
					p: {
						alias: 'production',
						desc: 'Enable `production` mode. Defaults to `false`',
						type: 'bool',
					},
					l: {
						alias: 'logLevel',
						desc: 'Defining log level. Defaults to "INFO" in `production` mode, "DEBUG" in `development` mode',
						choices: [
							'ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF',
						],
					},
					w: {
						alias: 'watch',
						desc: 'Enable watch mode. Defaults to `false`',
						type: 'bool',
					},
					f: {
						alias: 'force',
						desc: 'Force restart even if the process is exists',
						type: 'bool',
					},
					c: {
						alias: 'configFile',
						desc: `Path to the config file. Defaults to "${defaultConfigFile}"`,
						type: 'string',
					},
					'configWalk': {
						desc: 'Walk to resolve config file',
						default: true,
						type: 'bool',
					},
					root: {
						desc: 'Root dir. Defaults to `process.cwd()`',
						type: 'string',
					},
					'logsDir': {
						desc: 'Log files dir. Defaults to ".logs"',
						type: 'string',
					},
					port: {
						desc: 'Server port',
						type: 'number',
					},
					'maxRestarts': {
						desc: 'Defining max restarts if crashed. Defaults to `-1` (`-1` equals to `Infinity`) in `production` mode, `0` in `development` mode',
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
			cliStart(argv).catch(logger.error);
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
				})
				.argv
			;
		},
		handler(argv) {
			stop(argv).catch(logger.error);
		},
	})
	.command({
		command: 'list',
		aliases: ['ls'],
		desc: 'List processes',
		handler(argv) {
			list(argv).catch(logger.error);
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
			log(argv).catch(logger.error);
		},
	})
	.command({
		command: 'dir [name]',
		desc: 'Show dir',
		handler(argv) {
			dir(argv).catch(logger.error);
		},
	})
	.env(upperCase(name))
	.alias('h', 'help')
	.help()
	.version(version)
	.epilogue(gradient.mind('Powered by cantonjs'))
	.argv
;
