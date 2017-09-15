
import { start, stop } from './utils';
import getPort from 'get-port';
import fetch from 'node-fetch';

afterEach(stop);

describe('start server', () => {
	test('server start', async () => {
		const port = await getPort();
		return start(['start', '--port', port])
			.assertUntil(/started/)
			.assert(/ready/, {
				async action() {
					await fetch(`http://localhost:${port}`);
				}
			})
			.done()
		;
	});

	test('dev server start', async () => {
		const port = await getPort();
		return start(['start', '--port', port], {
			execOptions: {
				env: {
					...process.env,
					NODE_ENV: 'development',
				},
			},
		})
			.assertUntil(/started/)
			.assert(/Local URL/)
			.assert(/External URL/)
			.assertUntil(/ready/, {
				async action() {
					await fetch(`http://localhost:${port}`);
				}
			})
			.done()
		;
	});
});
