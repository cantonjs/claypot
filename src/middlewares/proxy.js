
import httpProxy from '../utils/httpProxy';
import mount from 'koa-mount';
import { forEach } from 'lodash';

export default function proxy(app, options) {
	forEach(options, (proxyConfig, pathname) => {
		app.use(mount(pathname, httpProxy(proxyConfig)));
	});
}
