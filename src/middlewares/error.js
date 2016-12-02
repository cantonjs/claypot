
import error from 'koa-error';

export default (app, options) => app.use(error(options));
