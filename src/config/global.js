
import Configstore from 'configstore';
import { dirname, join } from 'path';
import { name } from '../../package.json';

const conf = new Configstore(name, {}, {
	globalConfigPath: true,
});

const rootDir = dirname(conf.path);

conf.set('rootDir', rootDir);
conf.set('pidDir', join(rootDir, 'pids'));
conf.set('socketDir', join(rootDir, 'sockets'));

export default conf.all;
