
import history from 'koa-connect-history-api-fallback';

export default (app, options) => app.use(history(options));
