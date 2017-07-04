
import createMiddlewarePlugin from '../utils/createMiddlewarePlugin';
import middleware from '../middlewares/historyAPIFallback';

export default createMiddlewarePlugin(middleware);
