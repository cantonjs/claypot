import { startPure } from '../src';
import { resolve } from 'path';
import getPort from 'get-port';
import fetch from 'node-fetch';

describe('built-in middlewares', () => {
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

	test('should `notFound` work', async () => {
		server = await startPure(baseConfig);
		const res = await fetch(`http://localhost:${baseConfig.port}`);
		expect(res.ok).toBe(false);
		expect(res.status).toBe(404);
	});

	test('should `responseTime` work', async () => {
		server = await startPure(baseConfig);
		const res = await fetch(`http://localhost:${baseConfig.port}`);
		const responseTime = res.headers.get('X-Response-Time');
		expect(/^\d+ms/.test(responseTime)).toBe(true);
	});

	test('should `static` work', async () => {
		server = await startPure({ ...baseConfig, static: 'fixtures/static' });
		const res = await fetch(`http://localhost:${baseConfig.port}/hello.html`);
		expect(res.ok).toBe(true);
	});

	test('should `static` with maxAge object work', async () => {
		server = await startPure({
			...baseConfig,
			static: {
				dir: 'fixtures/static',
				maxAge: {
					'/hello.html': '1d',
					'*': '2d',
				},
			},
		});
		const hello = await fetch(`http://localhost:${baseConfig.port}/hello.html`);
		expect(hello.headers.get('cache-control')).toBe('max-age=86400');
		const world = await fetch(`http://localhost:${baseConfig.port}/world.html`);
		expect(world.headers.get('cache-control')).toBe('max-age=172800');
	});

	test('should `compress` work', async () => {
		server = await startPure({
			...baseConfig,
			compress: true,
			static: 'fixtures/static',
		});
		const { headers } = await fetch(
			`http://localhost:${baseConfig.port}/hello.html`,
		);
		expect(headers.get('Content-Encoding')).toBe('gzip');
		expect(headers.get('Transfer-Encoding')).toBe('chunked');
	});

	test('should not `compress` images', async () => {
		server = await startPure({
			...baseConfig,
			compress: true,
			static: 'fixtures/static',
		});
		const { headers } = await fetch(
			`http://localhost:${baseConfig.port}/img.jpg`,
		);
		expect(headers.get('Content-Encoding')).not.toBe('gzip');
	});

	test('should `httpError` work', async () => {
		server = await startPure({
			...baseConfig,
			plugins: ['./fixtures/plugins/HttpError'],
		});
		const res = await fetch(`http://localhost:${baseConfig.port}/test`);
		const contentType = res.headers.get('Content-Type');
		expect(contentType).toBe('text/html; charset=utf-8');
		expect(res.status).toBe(500);
	});

	test('should `helmet` work', async () => {
		server = await startPure({ ...baseConfig, helmet: true });
		const { headers } = await fetch(`http://localhost:${baseConfig.port}`);
		expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
		expect(headers.get('X-Powered-By')).toBe('PHP 5.4.0');
		expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');
	});

	test('should `favicon` work', async () => {
		server = await startPure(baseConfig);
		const res = await fetch(`http://localhost:${baseConfig.port}/favicon.ico`);
		expect(res.ok).toBe(true);
	});

	test('should `historyAPIFallback` work', async () => {
		server = await startPure({
			...baseConfig,
			static: 'fixtures/history',
			historyAPIFallback: true,
		});
		const res = await fetch(`http://localhost:${baseConfig.port}/world`);
		expect(res.ok).toBe(true);
	});
});
