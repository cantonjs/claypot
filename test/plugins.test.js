import { startPure } from '../src';
import { resolve } from 'path';
import getPort from 'get-port';

describe('plugins', () => {
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

	test('bootstrap hook', async () => {
		server = await startPure({
			...baseConfig,
			plugins: ['fixtures/plugins/Bootstrap'],
		});
		expect(server.foo).toEqual('bar');
	});

	test('databases hook', async () => {
		server = await startPure({
			...baseConfig,
			plugins: ['fixtures/plugins/Databases'],
			dbs: { foo: {} },
		});
		expect(server.dbsKeys).toEqual(['foo']);
	});

	test('cacheStores hook', async () => {
		server = await startPure({
			...baseConfig,
			plugins: ['fixtures/plugins/CacheStores'],
			dbs: { foo: { cache: {} } },
		});
		expect(Object.keys(server.cacheStores)).toEqual(['foo']);
	});

	test('models hook', async () => {
		server = await startPure({
			...baseConfig,
			models: 'fixtures/models',
			plugins: ['fixtures/plugins/Models'],
		});
		expect(server.models.hello.bar).toBe('baz');
	});
});
