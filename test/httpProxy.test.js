import { startPure } from '../src';
import {
	startThirdPartyServer,
	stopThirdPartyServer,
} from './fixtures/thirdPartyServer';
import getPort from 'get-port';
import fetch from 'node-fetch';
import qs from 'querystring';
import { resolve } from 'path';

describe('proxy middleware', () => {
	let server;
	let baseConfig = {};
	let thirdPartyServerPort;

	beforeEach(async () => {
		thirdPartyServerPort = await getPort();
		await startThirdPartyServer(thirdPartyServerPort);
		baseConfig = {
			port: await getPort(),
			cwd: resolve('test'),
		};
	});

	afterEach(async () => {
		await stopThirdPartyServer();
		if (server) {
			await server.close();
		}
		server = null;
	});

	test('proxy server with root path', async () => {
		server = await startPure({
			...baseConfig,
			proxy: { '/': `http://localhost:${thirdPartyServerPort}` },
		});
		const res = await fetch(`http://localhost:${baseConfig.port}/hello/`);
		const json = await res.json();
		expect(json).toEqual({ hello: 'hello' });
	});

	test('proxy server with a pathname', async () => {
		server = await startPure({
			...baseConfig,
			proxy: { '/': `http://localhost:${thirdPartyServerPort}/hello` },
		});
		const res = await fetch(`http://localhost:${baseConfig.port}`);
		const json = await res.json();
		expect(json).toEqual({ hello: 'hello' });
	});

	test('add multiple proxy servers', async () => {
		server = await startPure({
			...baseConfig,
			proxy: {
				'/a': `http://localhost:${thirdPartyServerPort}/hello`,
				'/b': `http://localhost:${thirdPartyServerPort}/world`,
			},
		});
		const resA = await fetch(`http://localhost:${baseConfig.port}/a`);
		const jsonA = await resA.json();
		expect(jsonA).toEqual({ hello: 'hello' });
		const resB = await fetch(`http://localhost:${baseConfig.port}/b`);
		const jsonB = await resB.json();
		expect(jsonB).toEqual({ world: 'world' });
	});

	test('proxy server with adding queries', async () => {
		server = await startPure({
			...baseConfig,
			proxy: {
				'/': {
					target: `http://localhost:${thirdPartyServerPort}`,
					query: {
						hello: 'world',
					},
				},
			},
		});
		const res = await fetch(`http://localhost:${baseConfig.port}/query`);
		const json = await res.json();
		expect(json).toEqual({ hello: 'world' });
	});

	test('proxy server with application/x-www-form-urlencoded', async () => {
		server = await startPure({
			...baseConfig,
			proxy: {
				'/': {
					target: `http://localhost:${thirdPartyServerPort}`,
					contentType: 'application/x-www-form-urlencoded',
				},
			},
		});
		const res = await fetch(`http://localhost:${baseConfig.port}/form`, {
			method: 'POST',
			body: JSON.stringify({ hello: 'world' }),
		});
		const json = await res.json();
		expect(json).toEqual({ hello: 'world' });
	});

	test('proxy server with application/json', async () => {
		server = await startPure({
			...baseConfig,
			proxy: {
				'/': {
					target: `http://localhost:${thirdPartyServerPort}`,
					contentType: 'application/json',
				},
			},
		});
		const res = await fetch(`http://localhost:${baseConfig.port}/json`, {
			method: 'POST',
			body: qs.stringify({ hello: 'world' }),
		});
		const json = await res.json();
		expect(json).toEqual({ hello: 'world' });
	});
});
