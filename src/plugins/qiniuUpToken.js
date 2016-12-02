
import koa from 'koa';
import qiniu from 'qiniu';

export default ({ key, secret, bucket }) => {
	const app = koa();
	app.use(function * () {
		const expiresIn = 36000000;
		const expiresInUnix = expiresIn / 1000;
		qiniu.conf.ACCESS_KEY = key;
		qiniu.conf.SECRET_KEY = secret;
		const putPolicy = new qiniu.rs.PutPolicy2({
			scope: bucket,
			expires: expiresInUnix,
		});
		const uptoken = putPolicy.token();
		this.body = { uptoken, expiresIn, expiresInUnix };
	});
	return app;
};
