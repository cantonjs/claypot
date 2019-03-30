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

	test('will handle next middleware if not matched', async () => {
		const middleware = jest.fn((ctx) => (ctx.body = 'oops'));
		await createApp()
			.post('/', (ctx) => (ctx.body = 'awesome'))
			.use(middleware)
			.test()
			.post('/oops')
			.expect(200, 'oops');
		expect(middleware).toHaveBeenCalledTimes(1);
	});

	test('will not handle next middleware if matched', async () => {
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
});
