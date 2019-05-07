import { createApp } from '../../src/application';
import { resolve } from 'path';

describe('view', () => {
	test('views full path', async () => {
		return createApp()
			.view(resolve(__dirname, '/views'), { extension: 'ejs' })
			.get('/', async (ctx) => ctx.render('hello', { title: 'hi' }))
			.test()
			.get('/')
			.expect(200, '<h1>hi</h1>\n');
	});

	test('views in basePath', async () => {
		return createApp()
			.setBaseDir(__dirname)
			.view('/views', { extension: 'ejs' })
			.get('/', async (ctx) => ctx.render('hello', { title: 'hi' }))
			.test()
			.get('/')
			.expect(200, '<h1>hi</h1>\n');
	});
});
