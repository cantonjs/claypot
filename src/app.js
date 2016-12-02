
import './redis';
import config from './utils/getConfig';
import koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { log } from 'util';

const { port } = config;
const app = koa();

useMiddlewares(app);

app.listen(port, () => {
	log(`${config.name} started.`);
});
