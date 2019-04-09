import { startPure, utils } from '../src';
import { resolve } from 'path';

describe('built-in middlewares', () => {
	const config = { cwd: resolve('test'), logLevel: 'ERROR' };

	test('should `notFound` work', async () =>
		utils
			.test(await startPure(config))
			.get('/')
			.expect(404));

	test('should `responseTime` work', async () =>
		utils
			.test(await startPure(config))
			.get('/')
			.expect('X-Response-Time', /^\d+ms/));

	test('should `static` work', async () =>
		utils
			.test(await startPure({ ...config, static: 'fixtures/static' }))
			.get('/hello.html')
			.expect(200));

	test('should `static` with array work', async () =>
		utils
			.test(
				await startPure({
					...config,
					static: [{ dir: 'fixtures/history' }, 'fixtures/static'],
				}),
			)
			.get('/hello.html')
			.expect(200));

	test('should `static.isEnabled = false` option work', async () =>
		utils
			.test(
				await startPure({
					...config,
					static: { dir: 'fixtures/static', isEnabled: false },
				}),
			)
			.get('/img.jpg')
			.expect(404));

	test('should `static.maxAge` option work', async () =>
		utils
			.test(
				await startPure({
					...config,
					static: { dir: 'fixtures/static', maxAge: '3d' },
				}),
			)
			.get('/img.jpg')
			.expect('cache-control', 'max-age=259200'));

	test('should `static.test` option work', async () => {
		const app = await startPure({
			...config,
			static: { dir: 'fixtures/static', test: '**/*.js' },
		});
		const testServer = utils.createTestServer(app);
		await testServer.get('/script.js').expect(200);
		await testServer.get('/img.jpg').expect(404);
		return app.close();
	});

	test('should `static.rules` option work', async () => {
		const app = await startPure({
			...config,
			static: {
				dir: 'fixtures/static',
				maxAge: '1d',
				rules: [{ test: '**/*.js', maxAge: 0 }],
			},
		});
		const testServer = utils.createTestServer(app);
		await testServer.get('/script.js').expect('cache-control', 'max-age=0');
		await testServer.get('/img.jpg').expect('cache-control', 'max-age=86400');
		return app.close();
	});

	test('should `compress` work', async () =>
		utils
			.test(
				await startPure({
					...config,
					compress: true,
					static: 'fixtures/static',
				}),
			)
			.get('/hello.html')
			.expect('Content-Encoding', 'gzip')
			.expect('Transfer-Encoding', 'chunked'));

	test('should not `compress` images', async () =>
		utils
			.test(
				await startPure({
					...config,
					compress: true,
					static: 'fixtures/static',
				}),
			)
			.get('/img.jpg')
			.expect((res) => {
				expect(res.headers['Content-Encoding']).not.toBe('gzip');
			}));

	test('should `httpError` work', async () =>
		utils
			.test(
				await startPure({
					...config,
					plugins: ['./fixtures/plugins/HttpError'],
				}),
			)
			.get('/test')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(500));

	test('should `helmet` work', async () =>
		utils
			.test(await startPure({ ...config, helmet: true }))
			.get('/')
			.expect('X-Frame-Options', 'SAMEORIGIN')
			.expect('X-Powered-By', 'PHP 5.4.0')
			.expect('X-XSS-Protection', '1; mode=block'));

	test('should `favicon` work', async () =>
		utils
			.test(await startPure(config))
			.get('/favicon.ico')
			.expect(200));

	test('should `historyAPIFallback` work', async () =>
		utils
			.test(
				await startPure({
					...config,
					static: 'fixtures/history',
					historyAPIFallback: true,
				}),
			)
			.get('/world')
			.set('Accept', 'text/html')
			.expect(200));

	test('should `rewrites` work', async () =>
		utils
			.test(
				await startPure({
					...config,
					static: 'fixtures/history',
					rewrites: { '/baz/(.*)': '/$1.html' },
				}),
			)
			.get('/baz/foo/bar')
			.expect(200));

	test('should `rewrites` work with array', async () =>
		utils
			.test(
				await startPure({
					...config,
					static: 'fixtures/history',
					rewrites: ['/baz/(.*)', '/$1.html'],
				}),
			)
			.get('/baz/foo/bar')
			.expect(200));
});
