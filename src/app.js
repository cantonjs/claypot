
import './redis';
import config from './config';
import koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { appLogger } from './utils/logger';

const { port, name } = config;
const app = koa();

useMiddlewares(app);

app.listen(port, () => {
	appLogger.info(`${name} started.`);
}).on('error', (err) => {
	appLogger.error(err);
});
