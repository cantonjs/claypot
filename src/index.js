
import { start, resolveConfig } from 'pot-js';

async function init() {
	const config = await resolveConfig({
		config: 'Claypotfile.js',
		configWalk: true,
		entry: 'src/start.js',
		workspace: 'claypot',
		inject: true,
		stdio: ['ipc', 'inherit', 'inherit'],
	});

	await start(config);
}

init().catch((err) => console.error(err));
