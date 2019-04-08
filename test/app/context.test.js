import { createApp } from '../../src/application';
import { resolve } from 'path';

describe('context', () => {
	test('sendFile', async () => {
		return createApp()
			.setStaticRoot(resolve(__dirname, './fixtures'))
			.use(async (ctx) => ctx.sendFile('index.html'))
			.test()
			.get('/')
			.expect(200, '<h1>foo</h1>\n');
	});
});
