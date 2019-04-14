import { createApp } from '../../src/application';

describe('rewrite', () => {
	test('rewrite full path', async () => {
		return createApp()
			.rewrite('/foo', '/bar')
			.get('/bar', (ctx) => (ctx.body = 'bar'))
			.test()
			.get('/foo')
			.expect(200, 'bar');
	});

	test('rewrite path with "$" params', async () => {
		return createApp()
			.rewrite('/foo/:bar', '/$1')
			.get('/baz', (ctx) => (ctx.body = 'baz'))
			.test()
			.get('/foo/baz')
			.expect(200, 'baz');
	});

	test('rewrite path with named params', async () => {
		return createApp()
			.rewrite('/foo/:bar', '/:bar/baz')
			.get('/qux/baz', (ctx) => (ctx.body = 'baz'))
			.test()
			.get('/foo/qux')
			.expect(200, 'baz');
	});
});
