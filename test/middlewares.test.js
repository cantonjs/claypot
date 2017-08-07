
import { start, stop } from './utils';
import getPort from 'get-port';
import fetch from 'node-fetch';

afterEach(stop);

describe('built-in middlewares', () => {
	test('should `notFound` work', async () => {
		const port = await getPort();
		return start(['start', '--port', port]).assertUntil(/ready/, {
			async action() {
				const res = await fetch(`http://localhost:${port}`);
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
					await expect(
						fetch(`http://localhost:${port}/test`)
					).rejects.toBeDefined();
				}
			})
			.done()
		;
	});

	// test('should `helmet` work', async () => {
	// 	const port = await getPort();
	// 	return start(['start', '--port', port, '--logLevel=TRACE']).assertUntil(/ready/, {
	// 		async action() {
	// 			const { headers } = await fetch(`http://localhost:${port}`);
	// 			expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
	// 			expect(headers.get('X-Powered-By')).toBe('PHP 5.4.0');
	// 			expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');
	// 		}
	// 	}).done();
	// });

	// test('should `compress` work', async () => {
	// 	const port = await getPort();
	// 	return start(['start', '--port', port]).assertUntil(/ready/, {
	// 		async action() {
	// 			const { headers } = await fetch(`http://localhost:${port}`);
	// 			expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
	// 			expect(headers.get('X-Powered-By')).toBe('PHP 5.4.0');
	// 			expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');
	// 		}
	// 	}).done();
	// });

});
