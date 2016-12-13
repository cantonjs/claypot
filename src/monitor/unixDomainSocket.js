
import { ensureDir } from 'fs-promise';
import ipc from 'node-ipc';
import { join } from 'path';
import { monitorLogger } from '../utils/logger';
import { globalConfig } from '../config';
import { name as appspace } from '../../package.json';

export const startServer = async (id) => {
	const socketRoot = globalConfig.socketDir;

	await ensureDir(socketRoot);

	return new Promise((resolve) => {
		Object.assign(ipc.config, {
			appspace,
			id,
			silent: true,
			stopRetrying: true,
		});

		const path = join(globalConfig.socketDir, id);

		ipc.serve(path, () => {
			const { server } = ipc;

			server.on('error', (err) => {
				monitorLogger.error('server socket error', err);
			});

			resolve(server);
		});
		ipc.server.start();
	});
};

export const stopServer = () => ipc.server.stop();

export const startClient = (clientId, serverId, path) => {
	return new Promise((resolve) => {
		Object.assign(ipc.config, {
			appspace,
			id: clientId,
			silent: true,
			stopRetrying: true,
		});

		ipc.connectTo(serverId, path, () => {
			const socket = ipc.of[serverId];
			socket.on('connect', () => {

				socket.on('error', (err) => {
					monitorLogger.error('socket error', err);
				});

				resolve(socket);
			});
		});
	});
};

export const disconnect = ::ipc.disconnect;
