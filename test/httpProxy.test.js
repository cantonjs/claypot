
import { start, stop } from './utils';
import {
	startThirdPartyServer,
	stopThirdPartyServer,
} from './fixtures/thirdPartyServer';
import getPort from 'get-port';
import fetch from 'node-fetch';
import qs from 'querystring';

let thirdPartyServerPort;

beforeEach(async () => {
	thirdPartyServerPort = await getPort();
	await startThirdPartyServer(thirdPartyServerPort);
});

afterEach(async () => {
	await stopThirdPartyServer();
	await stop();
});

describe('proxy middleware', () => {
	test('proxy server with root path', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--proxy./', `http://localhost:${thirdPartyServerPort}`,
		];

		await start(command)
			.assertUntil(/started/)
			.assertUntil(/ready/, {
				async action() {
					const res = await fetch(`http://localhost:${port}/hello/`);
					const json = await res.json();
					expect(json).toEqual({ hello: 'hello' });
				}
			})
			.done()
		;
	});

	test('proxy server with a pathname', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--proxy./', `http://localhost:${thirdPartyServerPort}/hello`,
		];

		await start(command)
			.assertUntil(/started/)
			.assertUntil(/ready/, {
				async action() {
					const res = await fetch(`http://localhost:${port}`);
					const json = await res.json();
					expect(json).toEqual({ hello: 'hello' });
				}
			})
			.done()
		;
	});

	test('add multiple proxy servers', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--proxy./a', `http://localhost:${thirdPartyServerPort}/hello`,
			'--proxy./b', `http://localhost:${thirdPartyServerPort}/world`,
		];

		await start(command)
			.assertUntil(/started/)
			.assertUntil(/ready/, {
				async action() {
					const resA = await fetch(`http://localhost:${port}/a`);
					const jsonA = await resA.json();
					expect(jsonA).toEqual({ hello: 'hello' });
					const resB = await fetch(`http://localhost:${port}/b`);
					const jsonB = await resB.json();
					expect(jsonB).toEqual({ world: 'world' });
				}
			})
			.done()
		;
	});

	test('proxy server with adding queries', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--proxy./.target', `http://localhost:${thirdPartyServerPort}`,
			'--proxy./.query.hello', 'world',
		];

		await start(command)
			.assertUntil(/started/)
			.assertUntil(/ready/, {
				async action() {
					const res = await fetch(`http://localhost:${port}/query`);
					const json = await res.json();
					expect(json).toEqual({ hello: 'world' });
				}
			})
			.done()
		;
	});

	test('proxy server with application/x-www-form-urlencoded', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--proxy./.target', `http://localhost:${thirdPartyServerPort}`,
			'--proxy./.contentType', 'application/x-www-form-urlencoded',
		];

		await start(command)
			.assertUntil(/started/)
			.assertUntil(/ready/, {
				async action() {
					const res = await fetch(`http://localhost:${port}/form`, {
						method: 'POST',
						body: JSON.stringify({ hello: 'world' }),
					});
					const json = await res.json();
					expect(json).toEqual({ hello: 'world' });
				}
			})
			.done()
		;
	});

	test('proxy server with application/json', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--proxy./.target', `http://localhost:${thirdPartyServerPort}`,
			'--proxy./.contentType', 'application/json',
		];

		await start(command)
			.assertUntil(/started/)
			.assertUntil(/ready/, {
				async action() {
					const res = await fetch(`http://localhost:${port}/json`, {
						method: 'POST',
						body: qs.stringify({ hello: 'world' }),
					});
					const json = await res.json();
					expect(json).toEqual({ hello: 'world' });
				}
			})
			.done()
		;
	});

});
