
import { start, stop } from './utils';
import getPort from 'get-port';
import fetch from 'node-fetch';

afterEach(stop);

describe('start server', () => {
	test('should server start', async () => {
		const port = await getPort();
		return start(['start', '--port', port])
			.assertUntil(/started/)
			.assertUntil(/ready/, {
				async action() {
					await fetch(`http://localhost:${port}`);
				}
			})
			.done()
		;
	});
});
