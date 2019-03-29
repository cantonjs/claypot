import { createApp } from './app';

describe('application', () => {
	test('GET /', async () => {
		return createApp()
			.test()
			.get('/')
			.expect(404);
	});
});
