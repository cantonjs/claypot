import { createApp } from './';

describe('router', () => {
	test('get', async () => {
		return createApp()
			.get('/', (ctx) => (ctx.body = 'awesome'))
			.test()
			.get('/')
			.expect(200, 'awesome');
	});

	test('post', async () => {
		return createApp()
			.post('/', (ctx) => (ctx.body = 'awesome'))
			.test()
			.post('/')
			.expect(200, 'awesome');
	});

	test('all', async () => {
		return createApp()
			.all('/', (ctx) => (ctx.body = 'awesome'))
			.test()
			.put('/')
			.expect(200, 'awesome');
	});

	test('multiple handlers', async () => {
		return createApp()
			.get(
				'/',
				async (ctx, next) => {
					ctx.foo = 'awesome';
					return next();
				},
				(ctx) => {
					ctx.body = ctx.foo;
				},
			)
			.test()
			.get('/')
			.expect(200, 'awesome');
	});

	test('fallback', async () => {
		const middleware = jest.fn();
		await createApp()
			.post('/', (ctx) => (ctx.body = 'awesome'))
			.use(middleware)
			.test()
			.post('/oops')
			.expect(404);
		expect(middleware).toHaveBeenCalledTimes(1);
	});

	test('not fallback', async () => {
		const middleware = jest.fn();
		await createApp()
			.post('/', (ctx) => (ctx.body = 'awesome'))
			.use(middleware)
			.test()
			.post('/')
			.expect(200, 'awesome');
		expect(middleware).toHaveBeenCalledTimes(0);
	});

	test('path params', async () => {
		return createApp()
			.get('/:foo/:bar', (ctx) => (ctx.body = JSON.stringify(ctx.params)))
			.test()
			.get('/hello/world')
			.expect(200, JSON.stringify({ foo: 'hello', bar: 'world' }));
	});

	test('optional path params', async () => {
		return createApp()
			.get('/:foo/:bar?', (ctx) => (ctx.body = JSON.stringify(ctx.params)))
			.test()
			.get('/hello')
			.expect(200, JSON.stringify({ foo: 'hello' }));
	});

	test('nested', async () => {
		const api = createApp().get('/foo', (ctx) => (ctx.body = 'foo'));
		return createApp()
			.mount('/api', api)
			.test()
			.get('/api/foo')
			.expect(200, 'foo');
	});

	test('nested and fallback', async () => {
		const api = createApp().get('/foo', (ctx) => (ctx.body = 'foo'));
		return createApp()
			.mount('/api', api)
			.use((ctx) => (ctx.body = 'bar'))
			.test()
			.get('/api/bar')
			.expect(200, 'bar');
	});

	test('path', async () => {
		return createApp()
			.path('/foo', {
				post: (ctx) => (ctx.body = 'awesome'),
			})
			.test()
			.post('/foo')
			.expect(200, 'awesome');
	});

	test('method not allowed', async () => {
		return createApp()
			.get('/foo')
			.put('/foo')
			.test()
			.post('/foo')
			.expect('Allow', 'GET, PUT')
			.expect(405);
	});
});
