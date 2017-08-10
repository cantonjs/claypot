# HTTP Proxy

Claypot has a built-in HTTP proxy system which built on top of [node-http-proxy](https://github.com/nodejitsu/node-http-proxy).


## Defining HTTP proxy

The easiest way to define HTTP proxy is setting a key/value object to `proxy` field in `Claypotfile`.

The `key` is the root of URL path our HTTP proxy server. The `value` is the configuration of the proxy. Defining an URL `string` to `value` stands for the target of original server.

###### Example

Claypotfile.js

```js
module.export = {
    proxy: {
        '/proxy/a': 'http://127.0.0.1:3001',
        '/proxy/b': 'http://127.0.0.1:3002/foo/bar',
    },
};
```


## Advanced

HTTP proxy configuration value can also be an `object`. All [node-http-proxy options](https://github.com/nodejitsu/node-http-proxy#options) are available.

In addition, proxy configuration also supports these options:

- `query` (Object): Force assigning additional query fields to the original server.
- `contentType` (String): Force transforming `Content-Type`. Supports "application/json" and "application/x-www-form-urlencoded".

###### Example

Claypotfile.js

```js
module.export = {
    proxy: {
        '/proxy/a': {
            target: 'http://127.0.0.1:3001',
            query: {
                'accessToken': 'asdf:ghjkl',
            },
            contentType: 'application/x-www-form-urlencoded',
        },
    },
};
```
