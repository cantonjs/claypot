
import yargs from 'yargs';
import { upperCase } from 'lodash';
import { version, name } from '../../package.json';

const prefix = upperCase(name);

const { argv } = yargs
	.usage('$0 [args]')
	.env(prefix)
	.options({
		name: {
			desc: 'Server name',
			type: 'string',
		},
		p: {
			alias: 'port',
			desc: 'Server port',
			default: 3000,
			type: 'number',
		},
		c: {
			alias: 'config',
			desc: 'Path to the config file. Defaults to "Claypotfile.js"',
			type: 'string',
		},
		s: {
			alias: 'script',
			desc: 'Bootstrap command',
			default: 'node',
			type: 'string',
		},
	})
	.alias('h', 'help')
	.help()
	.version(version)
;

const { env } = process;

Object.assign(env, {
	[`${prefix}_NAME`]: argv.name || '',
	[`${prefix}_PORT`]: argv.port,
	[`${prefix}_COMMAND`]: argv.script,
});

export { argv };
