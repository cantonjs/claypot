import { startPure } from '../src';
import { resolve } from 'path';
import getPort from 'get-port';

describe('schemas', () => {
	let server;
	let baseConfig = {};

	beforeEach(async () => {
		baseConfig = {
			port: await getPort(),
			cwd: resolve('test'),
			schemas: 'fixtures/schemas',
		};
	});

	afterEach(async () => {
		if (server) {
			await server.close();
		}
		server = null;
	});

	test('get schemas', async () => {
		server = await startPure(baseConfig);
		expect(Object.keys(server.schemas)).toEqual(['hello']);
	});
});
