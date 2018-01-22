import { startPure } from '../src';
import { resolve } from 'path';
import getPort from 'get-port';

describe('models', () => {
	let server;
	let baseConfig = {};

	beforeEach(async () => {
		baseConfig = {
			port: await getPort(),
			cwd: resolve('test'),
		};
	});

	afterEach(async () => {
		if (server) {
			await server.close();
		}
		server = null;
	});

	test('get models', async () => {
		server = await startPure({ ...baseConfig, models: 'fixtures/models' });
		expect(Object.keys(server.models)).toEqual(['hello']);
	});

	test('run model method', async () => {
		server = await startPure({ ...baseConfig, models: 'fixtures/models' });
		expect(server.models.hello.test()).toBe(true);
	});

	test('get model by upper first', async () => {
		server = await startPure({ ...baseConfig, models: 'fixtures/models' });
		expect(server.models.Hello).toBe(server.models.hello);
	});

	test('run model method', async () => {
		server = await startPure({ ...baseConfig, models: 'fixtures/models' });
		expect(server.models.hello.test()).toBe(true);
	});

	test('extends model', async () => {
		server = await startPure({
			...baseConfig,
			models: 'fixtures/models',
			plugins: ['fixtures/plugins/ExtendsModels'],
		});
		expect(server.models.hello.$test.foo()).toBe('hello');
	});
});
