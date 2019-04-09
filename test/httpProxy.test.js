import { startPure, utils } from '../src';
import {
	startThirdPartyServer,
	stopThirdPartyServer,
} from './fixtures/thirdPartyServer';
import getPort from 'get-port';
import qs from 'querystring';
import { resolve } from 'path';

describe('proxy middleware', () => {
	const config = { cwd: resolve('test'), logLevel: 'ERROR' };
	let thirdPartyServerPort;

	beforeEach(async () => {
		thirdPartyServerPort = await getPort();
		await startThirdPartyServer(thirdPartyServerPort);
	});

	afterEach(async () => {
		await stopThirdPartyServer();
	});

	test('proxy server with root path', async () =>
		utils
			.test(
				await startPure({
					...config,
					proxy: { '/': `http://localhost:${thirdPartyServerPort}` },
				}),
			)
			.get('/hello/')
			.expect(200, JSON.stringify({ hello: 'hello' })));

	test('proxy server with a pathname', async () =>
		utils
			.test(
				await startPure({
					...config,
					proxy: { '/': `http://localhost:${thirdPartyServerPort}/hello` },
				}),
			)
			.get('/')
			.expect(200, JSON.stringify({ hello: 'hello' })));

	test('add multiple proxy servers', async () => {
		const app = await startPure({
			...config,
			proxy: {
				'/a': `http://localhost:${thirdPartyServerPort}/hello`,
				'/b': `http://localhost:${thirdPartyServerPort}/world`,
			},
		});
		const testServer = utils.createTestServer(app);
		await testServer.get('/a').expect(200, JSON.stringify({ hello: 'hello' }));
		await testServer.get('/b').expect(200, JSON.stringify({ world: 'world' }));
		return app.close();
	});

	test('proxy server with adding queries', async () =>
		utils
			.test(
				await startPure({
					...config,
					proxy: {
						'/': {
							target: `http://localhost:${thirdPartyServerPort}`,
							query: { hello: 'world' },
						},
					},
				}),
			)
			.get('/query')
			.expect(200, JSON.stringify({ hello: 'world' })));

	test('proxy server with application/x-www-form-urlencoded', async () =>
		utils
			.test(
				await startPure({
					...config,
					proxy: {
						'/': {
							target: `http://localhost:${thirdPartyServerPort}`,
							contentType: 'application/x-www-form-urlencoded',
						},
					},
				}),
			)
			.post('/form')
			.send({ hello: 'world' })
			.expect(200, JSON.stringify({ hello: 'world' })));

	test('proxy server with application/json', async () =>
		utils
			.test(
				await startPure({
					...config,
					proxy: {
						'/': {
							target: `http://localhost:${thirdPartyServerPort}`,
							contentType: 'application/json',
						},
					},
				}),
			)
			.post('/json')
			.send(qs.stringify({ hello: 'world' }))
			.expect(200, JSON.stringify({ hello: 'world' })));
});
