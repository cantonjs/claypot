
export default (app) => app.use(function * responseTime(next) {
	const start = new Date();

	yield next;

	const delta = new Date() - start;
	this.set('X-Response-Time', `${delta}ms`);
});
