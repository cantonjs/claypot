
import yargs from 'yargs';
import { version } from '../../package.json';
import { setEnv, prefix } from './Env';

const { argv } = yargs
	.usage('$0 [args]')
	.command({
		command: 'stop',
		desc: 'Stop server',
	})
	.env(prefix)
	.options({
		name: {
			desc: 'Server name',
			type: 'string',
		},
		port: {
			desc: 'Server port',
			default: 3000,
			type: 'number',
		},
		d: {
			alias: 'daemon',
			desc: 'Use as a daemon',
			type: 'bool',
			default: false,
		},
		c: {
			alias: 'config',
			desc: 'Path to the config file. Defaults to "Claypotfile.js"',
			type: 'string',
		},
		script: {
			desc: 'Bootstrap command',
			default: process.execPath,
			type: 'string',
		},
		p: {
			alias: 'production',
			desc: 'Short hand for set NODE_ENV="production" env',
			type: 'bool',
		},
		l: {
			alias: 'log-level',
			desc: 'Log level',
			choices: [
				'ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF',
			],
			default: 'INFO',
		},
	})
	.alias('h', 'help')
	.help()
	.version(version)
;

const { env } = process;
const useBabelNode = (env._ || '').endsWith('babel-node');

setEnv('name', argv.name || '');
setEnv('port', argv.port);
setEnv('daemon', argv.daemon);
setEnv('log_level', argv.logLevel);
setEnv('command', useBabelNode ? 'babel-node' : argv.script);

if (argv.production) {
	env.NODE_ENV = 'production';
}

export { argv };
