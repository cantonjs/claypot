
import { start } from 'pot-js';
import { join } from 'path';

const config = {
	entry: join(__dirname, 'start.js'),
	execCommand: 'babel-register',
	stdio: ['ipc', 'inherit', 'inherit'],
	// logLevel: 'DEBUG',
	logLevel: 'TRACE',
	watch: {
		enable: true,
	},
	env: {
		CLAYPOT_CONFIG: JSON.stringify({
			port: 3000,
		}),
		NODE_ENV: 'development',
	},
};

async function init() {
	await start(config);
}

init().catch((err) => console.error(err));
