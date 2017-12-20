
import { start, stop } from './utils';
import getPort from 'get-port';
import fetch from 'node-fetch';

beforeEach(() => { jest.setTimeout(10000); });

afterEach(stop);

describe('built-in middlewares', () => {
	test('should `notFound` work', async () => {
		const port = await getPort();
		return start(['start', '--port', port]).assertUntil(/ready/, {
			async action() {
				const res = await fetch(`http://localhost:${port}`);
				expect(res.ok).toBe(false);
				expect(res.status).toBe(404);
			}
		}).done();
	});

	test('should `responseTime` work', async () => {
		const port = await getPort();
		return start(['start', '--port', port]).assertUntil(/ready/, {
			async action() {
				const res = await fetch(`http://localhost:${port}`);
				const responseTime = res.headers.get('X-Response-Time');
				expect(/^\d+ms/.test(responseTime)).toBe(true);
			}
		}).done();
	});

	test('should `httpLogger` work', async () => {
		const port = await getPort();
		return start(['start', '--port', port])
			.assertUntil(/ready/, {
				async action() {
					await fetch(`http://localhost:${port}/test`);
				}
			})
			.assert(/GET \/test/)
			.done()
		;
	});

	test('should `static` work', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--static=fixtures/static',
		];
		return start(command).assertUntil(/ready/, {
			async action() {
				const res = await fetch(`http://localhost:${port}/hello.html`);
				expect(res.ok).toBe(true);
			}
		}).done();
	});

	test('should `compress` work', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--compress',
			'--static=fixtures/static',
		];
		return start(command).assertUntil(/ready/, {
			async action() {
				const { headers } = await fetch(`http://localhost:${port}/hello.html`);
				expect(headers.get('Content-Encoding')).toBe('gzip');
				expect(headers.get('Transfer-Encoding')).toBe('chunked');
			}
		}).done();
	});

	test('should `httpError` work', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--plugins', './fixtures/plugins/HttpError',
		];
		return start(command)
			.assertUntil(/ready/, {
				async action() {
					const res = await fetch(`http://localhost:${port}/test`);
					const contentType = res.headers.get('Content-Type');
					expect(contentType).toBe('text/html; charset=utf-8');
					expect(res.status).toBe(500);
				}
			})
			.done()
		;
	});

	test('should `helmet` work', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--helmet',
		];
		await start(command).assertUntil(/ready/, {
			async action() {
				const { headers } = await fetch(`http://localhost:${port}`);
				expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
				expect(headers.get('X-Powered-By')).toBe('PHP 5.4.0');
				expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');
			}
		}).done();
	});

	test('should `favicon` work', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
		];
		await start(command).assertUntil(/ready/, {
			async action() {
				const res = await fetch(`http://localhost:${port}/favicon.ico`);
				expect(res.ok).toBe(true);
			}
		}).done();
	});

	test('should `historyAPIFallback` work', async () => {
		const port = await getPort();
		const command = [
			'start',
			'--port', port,
			'--static=fixtures/history',
			'--historyAPIFallback'
		];
		return start(command).assertUntil(/ready/, {
			async action() {
				const res = await fetch(`http://localhost:${port}/world`);
				expect(res.ok).toBe(true);
			}
		}).done();
	});

});
