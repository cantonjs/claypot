# Configuration

One of the most important philosophies of Claypot is declarative programming. You can create a powerful server by defining a configuration file.

The configuration file must export a `JSON` object.

## Claypotfile

By default, claypot will find up the closest `Claypotfile.js` as configuration from the root of project.

You can use a custom file name by adding `--configFile` option to `claypot start` command. The `--configFile` value is the configuration file name for resolving.

## Properties

_Note: all properties are optional._

- `baseDir` (String): Defining the base directory for resolving modules or directories. Defaults to `cwd`.
- `clayInjection` (Boolean): Inject `clay` object to middleware context. Defaults to `true`.
- `compress` (Boolean|Object): Compress (gzip) static files. Defaults to `true` in `production` mode, `false` in `development` mode. Please Note that `true` will use [compressible](https://github.com/jshttp/compressible) to decide to compress.
- `configs` (Any): Custom data is recommended to set to here.
- `cwd` (String): Defining the current working directory. Defaults to `process.cwd()`. Not available in `startPure` method.
- `daemon` (Boolean): Enable `daemon` mode. Notice: to kill `daemon` process, please run `claypot stop ${name}`. Defaults to `false`. Not available in `startPure` method.
- `dbs` (Object): Defining databases. There's no built-in database by default. You probably need to use some plugins if you to use some databases.
- `env` (Object): Defining custom environments. Defaults to `process.env`. Not available in `startPure` method.
- `execArgs` (String|[String]): Executing arguments. Defaults to `[]`. Not available in `startPure` method.
- `execCommand` (String): Executing command. Defaults to `process.execPath`, which returns the absolute pathname of the executable that started the Node.js process i.e. `/usr/local/bin/node`. Not available in `startPure` method.
- `favicon` (Boolean|String): Defining favicon. Setting `false` to disable this feature. Setting a path string to set a custom favicon file. Defaults to `true`.
- `helmet` (Boolean|Object): Enable helmet for safety. Defaults to `true` in `production` mode, `false` in `development` mode.
- `historyAPIFallback` (Boolean|Object): Enable history api fallback. Useful for SPA. Defaults to `false`.
- `host` (String): Server host.
- `httpError` (Boolean|Object): Enable server error handling. Setting a object for custom config. Defaults to `true`.
- `httpLogger` (Boolean): Enable HTTP access logger. Defaults to `true`.
- `inspect` (Boolean|String|Object): Enable [node inspector](https://nodejs.org/api/cli.html#cli_inspect_host_port). Defaults to `false`. Not available in `startPure` method.
- `logLevel` (String|Object): Defining log level. See [pot-logger](https://github.com/cantonjs/pot-logger) for detail. Here are available levels:
  - ALL
  - TRACE
  - DEBUG (default in `development` mode)
  - INFO (default in `production` mode)
  - WARN
  - ERROR
  - FATAL
  - OFF
- `logsDir` (String): Defining log files directory. If `daemon` mode actived, log messages will write to some `.log` files. Defaults to `".logs"`.
- `maxRestarts` (Number): Defining max restarts if crashed. Defaults to `-1` (`-1` equals to `Infinity`) in `production` mode, `0` in `development` mode. Not available in `startPure` method.
- `models` (String): Defining models files directory. Defaults to `"models"`.
- `name` (String): Defining server name. Defaults to the basename of `process.cwd()`.
- `notFound` (Boolean): Enable 404 handling. Defaults to `true`.
- `outputHost` (Boolean|Object): Output host info for development. Please checkout [output-host](https://github.com/die-welle/output-host) for detail. Defaults to `true` in `development` mode. Not available in `startPure` method.
- `overrideConsole` (Boolean): Enable overriding native `console`. Defaults to `false`.
- `plugins` ([Object]): Defining plugins.
- `port` (Number): Defining the port of server. Defaults to an available port.
- `production` (Boolean): Enable `production` mode. Defaults to `true`.
- `proxy` (Object): Defining HTTP proxies. e.g. `{ '/my/path/': 'http://anti.proxy.com/' }`. See [HTTP Proxy](/guides/http_proxy.md) for detail.
- `responseTime` (Boolean): Enable `x-response-time` to HTTP response header. Defaults to `true`.
- `rewrites` (Object): URL Rewrite by setting a key/value object. e.g `{ '/assets/(.*)': '/js/$1' }`. Please checkout [koa-rewrite](https://github.com/koajs/rewrite) for detail.
- `schemas` (String): Defining schemas files directory. Defaults to `"schemas"`.
- `ssl` (Boolean|Object): Enable SSL. Defaults to `false`. Here are available props for object config:
  - `enable` (Boolean): Enable `ssl`. Defaults to `true`.
  - `port` (Number): HTTPS server port.
  - `key` (String): Key file path.
  - `cert` (String): Cert file path.
- `static` (Boolean|String|Object): Defining static directory. Defaults to `"static"`.
  - Setting `false` to disable this feature
  - Setting a `<dir>` string to define directory path
  - Setting an `object` to forward the options to [koa-send](https://github.com/koajs/send). But please note:
    - You must define an extra `dir` prop for static directory
    - `gzip` option will always NOT work, please use `compress` option in `claypot` configuration instead
    - New `match` option (using [multimatch](https://github.com/sindresorhus/multimatch)) for filtering paths
    - `maxAge` option will be `0` on `.html` file by default. That means it will NOT cache HTML file by default
    - If you want to make `maxAge` work on `.html` file, please set `cacheHtmlFile: true`
- `watch` (Boolean|Object): Enable watch mode. Defaults to `false`. Not available in `startPure` method. Here are available props for object config:
  - `enable` (Boolean): Enable `watch`. Defaults to `true`.
  - `dirs` (String|[String]): Defining watching directories.
  - `ignoreDotFiles` (Boolean): Ignore watching `.*` files. Defaults to `true`.
  - `ignoreNodeModulesDir` (Boolean): Ignore watching `node_modules` directory. Defaults to `true`.
