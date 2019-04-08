import { createApp } from '../../src/application';

describe('application', () => {
	test('GET /', async () => {
		return createApp()
			.test()
			.get('/')
			.expect(404);
	});
});
