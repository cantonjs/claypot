
import responseTime from 'koa-response-time';

export default (app) => app.use(responseTime());
