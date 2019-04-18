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

	test('no cors', (done) => {
		createApp()
			.post('/', (ctx) => (ctx.body = 'ok'))
			.test()
			.post('/')
			.set('Origin', 'http://foo.bar')
			.expect(200, (err, res) => {
				expect(err).toBe(null);
				expect(res.headers['access-control-allow-origin']).toBe(undefined);
				done();
			});
	});

	test('cors', async () => {
		return createApp()
			.cors()
			.post('/', (ctx) => (ctx.body = 'ok'))
			.test()
			.post('/')
			.set('Origin', 'http://foo.bar')
			.expect('Access-Control-Allow-Origin', 'http://foo.bar');
	});

	test('cors option', async () => {
		return createApp()
			.cors()
			.test()
			.options('/')
			.set('Origin', 'http://foo.bar')
			.set('Access-Control-Request-Method', 'PUT')
			.expect('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
	});
});
