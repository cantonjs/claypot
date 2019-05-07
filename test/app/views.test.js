import { createApp } from '../../src/application';
import { resolve } from 'path';

const options = {
	extension: 'html',
	map: { html: 'lodash' },
};

describe('view', () => {
	test('views full path', async () => {
		return createApp()
			.views(resolve(__dirname, 'fixtures/views'), options)
			.get('/', async (ctx) => ctx.render('hello', { title: 'hi' }))
			.test()
			.get('/')
			.expect(200, '<h1>hi</h1>');
	});

	test('views in basePath', async () => {
		return createApp()
			.setBaseDir(__dirname)
			.views('fixtures/views', options)
			.get('/', async (ctx) => ctx.render('hello', { title: 'hi' }))
			.test()
			.get('/')
			.expect(200, '<h1>hi</h1>');
	});
});
