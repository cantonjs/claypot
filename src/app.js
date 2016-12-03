
import './redis';
import config from './utils/getConfig';
import koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { log } from 'util';

const { port, name } = config;
const app = koa();

useMiddlewares(app);

app.listen(port, () => {
	log(`${name} started.`);
});
