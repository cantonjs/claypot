import http from 'http';
import url from 'url';
import bodyParser from 'co-body';
import qs from 'qs';
import delay from 'delay';
import pify from 'pify';
import yargs from 'yargs';

const server = http.createServer((req, res) => {
	const { method, headers, url: reqURL } = req;
	const { query: queryString, pathname } = url.parse(reqURL);
	const query = qs.parse(queryString);

	const end = (data, statusCode = 200) => {
		res.writeHead(statusCode, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(data));
	};

	const routes = {
		'GET /hello/': () => end({ hello: 'hello' }),
		'GET /world/': () => end({ world: 'world' }),
		'GET /ok': () => end({ method }),
		'POST /ok': () => end({ method }),
		'PUT /ok': () => end({ method }),
		'PATCH /ok': () => end({ method }),
		'DELETE /ok': () => end({ method }),
		'GET /query': () => end(query),
		'POST /json': () => bodyParser.json(req).then(end),
		'POST /form': () => bodyParser.form(req).then(end),
		'GET /headers': () => end(headers),
		'GET /delay': () =>
			delay(query.delay).then(() => end({ delay: query.delay || 2000 })),
		'GET /foo/bar': () => end(query),
		'GET /bad': () => end({ message: 'you bad' }, 400),
		'GET /bad/bad': () => end({ message: 'you bad bad' }, 500),
		'GET /bad/bad/bad': () => {
			throw new Error('oh shit');
		},
	};

	const route = `${method} ${pathname}`;

	if (typeof routes[route] === 'function') {
		routes[route]();
	}
	else if (route.startsWith('OPTIONS')) {
		end(null, 204);
	}
	else {
		end(null, 404);
	}
});

export function startThirdPartyServer(port = 3004) {
	return pify(::server.listen)(port);
}

export function stopThirdPartyServer() {
	return pify(::server.close)();
}

if (yargs.argv._[0] === 'start') {
	startThirdPartyServer();
}
