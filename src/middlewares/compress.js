import compress from 'koa-compress';

export default (app, options) => app.use(compress(options));
