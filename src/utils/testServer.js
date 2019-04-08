export function test(app) {
	return app.test();
}

export function createTestServer(app) {
	return app.test({ keepAlive: true });
}
