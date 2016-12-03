
import yargs from 'yargs';
import { version } from '../../package.json';

const { argv } = yargs
	.usage('$0 [args]')
	.options({
		name: {
			desc: 'Server name',
			type: 'string',
		},
		debug: {
			desc: 'Enable debug mode',
			default: false,
			type: 'bool',
		},
		p: {
			alias: 'port',
			desc: 'Server port',
			default: 3000,
			type: 'number',
		},
		c: {
			alias: 'config',
			desc: 'Path to the config file',
			// default: 'Claypotfile.js',
			type: 'string',
		}
	})
	.alias('h', 'help')
	.help()
	.version(version)
;

console.log('argv', argv);

export { argv };
