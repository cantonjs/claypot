import { createApp } from '../';

describe('application', () => {
	test('GET /', async () => {
		return createApp()
			.test()
			.get('/')
			.expect(404);
	});
});
