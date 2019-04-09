import { createApp } from '../../src/application';

describe('application', () => {
	test('get', async () => {
		return createApp()
			.test()
			.get('/')
			.expect(404);
	});

	test('bodyparser', async () => {
		return createApp()
			.bodyParser()
			.post('/', (ctx) => (ctx.body = ctx.request.body))
			.test()
			.post('/')
			.send({ foo: 'bar' })
			.expect(200, JSON.stringify({ foo: 'bar' }));
	});
});
