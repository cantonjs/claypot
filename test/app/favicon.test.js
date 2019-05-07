import { createApp } from '../../src/application';
import { resolve } from 'path';

describe('favicon', () => {
	test('no favicon', async () => {
		return createApp()
			.test()
			.get('/favicon.ico')
			.expect(404);
	});

	test('favicon', async () => {
		return createApp()
			.favicon()
			.test()
			.get('/favicon.ico')
			.expect(200);
	});

	test('favicon with path', async () => {
		return createApp()
			.setBaseDir(__dirname)
			.favicon('fixtures/favicons/test.ico')
			.test()
			.get('/favicon.ico')
			.expect(200);
	});
});
