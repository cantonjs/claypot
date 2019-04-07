import { createApp } from '../';
import { resolve } from 'path';

describe('static', () => {
	test('static()', async () => {
		return createApp()
			.setStaticRoot(resolve(__dirname, './fixtures'))
			.static()
			.test()
			.get('/')
			.expect(200, '<h1>foo</h1>\n');
	});

	test('static({ root })', async () => {
		return createApp()
			.static({ root: resolve(__dirname, './fixtures') })
			.test()
			.get('/')
			.expect(200, '<h1>foo</h1>\n');
	});

	test('static({ maxAge })', async () => {
		return createApp()
			.static({
				root: resolve(__dirname, './fixtures'),
				maxAge: 123,
			})
			.test()
			.get('/foo.js')
			.expect('cache-control', 'max-age=123');
	});

	test('static({ match })', async () => {
		return createApp()
			.static({
				root: resolve(__dirname, './fixtures'),
				match: '**/*.css',
			})
			.test()
			.get('/foo.js')
			.expect(404);
	});

	test('static({ rules })', async () => {
		return createApp()
			.static({
				root: resolve(__dirname, './fixtures'),
				maxAge: 123,
				rules: [{ match: '**/*.html', maxAge: 456 }],
			})
			.test()
			.get('/index.html')
			.expect('cache-control', 'max-age=456');
	});
});
