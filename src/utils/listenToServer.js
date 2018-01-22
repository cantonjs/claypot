export default async function listenToServer(server, port, host) {
	return new Promise((resolve, reject) => {
		server.on('error', reject);
		const args = [port, host, resolve].filter(Boolean);
		server.listen(...args);
	});
}
