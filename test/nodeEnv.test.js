import { start, stop } from './utils';
import getPort from 'get-port';
import fetch from 'node-fetch';
import { version } from '../package.json';

beforeEach(() => {
	jest.setTimeout(20000);
});

afterEach(stop);

describe('start server', () => {
	test.skip('server start', async () => {
		const port = await getPort();
		return start(['start', '--port', port])
			.assertUntil(/started/)
			.assert(/ready/, {
				async action() {
					await fetch(`http://localhost:${port}`);
				},
			})
			.done();
	});

	test('dev server start', async () => {
		const port = await getPort();
		return (
			start(['start', '--port', port], {
				env: {
					...process.env,
					NODE_ENV: 'development',
				},
			})
				.assertUntil(/started/)
				.assertUntil(new RegExp(version))
				.assert(/0 schema resolved/)
				.assert(/0 model created/)
				// .assert(/Local URL/)
				// .assert(/External URL/)
				.assertUntil(/ready/, {
					async action() {
						await fetch(`http://localhost:${port}`);
					},
				})
				.done()
		);
	});
});
