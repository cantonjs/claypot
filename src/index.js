
import { start } from 'pot-js';
import { join } from 'path';

const config = {
	entry: join(__dirname, 'start.js'),
	execCommand: 'babel-register',
	stdio: ['ipc', 'inherit', 'inherit'],
	// logLevel: 'DEBUG',
	logLevel: 'TRACE',
	watch: {
		enable: true,
	},
	env: {
		CLAYPOT_CONFIG: JSON.stringify({
			port: 3000,

			plugins: [
				{
					path: '/api/wx/jssdk',
					module: 'wechatJSSDK',
					options: {
						appId: 'wx5f1d2d6e2e0823ce',
						ticketURL: 'http://mp.ckoo.me/api/wx/jssdk/fetchTicket',
						fetchToken: 'SqHykfMKW7S9ZPZLBHcU3zr8',
					},
				},
				{
					path: '/',
					module: 'queryToCookie',
					options: {},
				},
				// {
				// 	path: '/wx/auth',
				// 	module: 'wechatWebAuth',
				// 	options: {
				// 		url: '<wechat_web_auth_url>',
				// 	},
				// },
				{
					path: '/api/qiniu/uptoken',
					module: 'qiniuUpToken',
					options: {
						key: 'y8uD8JThsfmo6UMMz2C4WCZaZ1HfaAO-2RDAaOAG',
						secret: 'M6tcRj9jXumurKg4bvstmzQHAP2xjbqe7jb_yFAA',
						bucket: 'apple110-qr',
					},
				},
				{
					path: '/images/m',
					module: 'urlProxy',
				},
				{
					path: '/api/proxy',
					module: 'proxy',
					options: {
						target: 'http://127.0.0.1:3004',
					},
				},
			],

		}),
		NODE_ENV: 'development',
	},
};

async function init() {
	await start(config);
}

init().catch((err) => console.error(err));
