
import Koa from 'koa';
import qiniu from 'qiniu';

export default class QiniuUpToken {
	constructor(options) {
		this._options = options;
	}

	middleware(parent) {
		const { path, key, secret, bucket } = this._options;
		const app = new Koa();
		app.use(async (ctx) => {
			const expiresIn = 36000000;
			const expiresInUnix = expiresIn / 1000;
			qiniu.conf.ACCESS_KEY = key;
			qiniu.conf.SECRET_KEY = secret;
			const putPolicy = new qiniu.rs.PutPolicy2({
				scope: bucket,
				expires: expiresInUnix,
			});
			const uptoken = putPolicy.token();
			ctx.body = { uptoken, expiresIn, expiresInUnix };
		});
		parent.mount(path, app);
	}
}

// export default ({ key, secret, bucket }) => {
// 	const app = new Koa();
// 	app.use(async (ctx) => {
// 		const expiresIn = 36000000;
// 		const expiresInUnix = expiresIn / 1000;
// 		qiniu.conf.ACCESS_KEY = key;
// 		qiniu.conf.SECRET_KEY = secret;
// 		const putPolicy = new qiniu.rs.PutPolicy2({
// 			scope: bucket,
// 			expires: expiresInUnix,
// 		});
// 		const uptoken = putPolicy.token();
// 		ctx.body = { uptoken, expiresIn, expiresInUnix };
// 	});
// 	return app;
// };
