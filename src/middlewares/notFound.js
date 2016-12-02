
export default (app) => app.use(function * notFound(next) {
	yield next;

	const body = this.body;
	const status = this.status || 404;
	const noContent = ~[204, 205, 304].indexOf(status);

	// ignore body
	if (noContent) { return; }

	// status body
	if (!body) { this.throw(status); }
});
