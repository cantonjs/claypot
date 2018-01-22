import Plugins from '../utils/plugins';
import httpProxy from '../utils/httpProxy';

export default function applyMiddlewares(app, config) {
	Plugins.sync('proxy', app, httpProxy, config);
	Plugins.sync('middleware', app, config);
}
