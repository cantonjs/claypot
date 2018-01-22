export function listenToServer(server, port, host) {
	return new Promise((resolve, reject) => {
		server.on('error', reject);
		const args = [port, host, resolve].filter(Boolean);
		server.listen(...args);
	});
}

export function closeServer(server) {
	return new Promise((resolve, reject) => {
		server.close((err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}
