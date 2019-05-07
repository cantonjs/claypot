import { createApp } from '../../src/application';
import { resolve } from 'path';

describe('context', () => {
	test('sendFile', async () => {
		return createApp()
			.setBaseDir(resolve(__dirname, './fixtures'))
			.use(async (ctx) => ctx.sendFile('index.html'))
			.test()
			.get('/')
			.expect(200, '<h1>foo</h1>\n');
	});
});
