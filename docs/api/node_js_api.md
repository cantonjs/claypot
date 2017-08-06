# Node.js API

Claypot provides a Node.js API which can be used directly in Node.js runtime.

The Node.js API is useful in scenarios in which you need to write models or plugins.


## Example

```js
import { cache, logger } from 'claypot';
export default class MyModel {
    async hello() {
        const message = await cache.get('myMessage');
        logger.debug(message);
        // do sth...
    }
}
```


## API Reference

#### config Object

```js
import { config } from 'claypot';
```

Get the configuration object. (READ ONLY)

###### Tips

It useful to use `config.production` to detect current environment.


#### cache Object

```js
import { cache } from 'claypot';
```

Get the default cache store.

A cache store is powered by [cache-manager](https://github.com/BryanDonovan/node-cache-manager) which provides the following methods:

- `get(key)`: Get a cache value by key.
- `set(key, value, options)`: Get a cache value by key.
- `wrap(key, save, options)`: Get a cache value with a fallback save function.

All of these methods returns a promise.

Please checkout [cache-manager](https://github.com/BryanDonovan/node-cache-manager) for detail.


#### cacheStores Object

```js
import { cacheStores } from 'claypot';
```

Get all cache stores. Claypot support multi cache stores by defining `dbs` configuration.


#### models Object

```js
import { models } from 'claypot';
```

Get models.


#### logger Object

```js
import { logger } from 'claypot';
```

Get the default logger.

Claypot provides a powerful log system powered by [pot-logger](https://github.com/cantonjs/pot-logger). A logger provides a set of log levels, such as `logger.debug()`, `logger.info()`, `logger.error()`, etc. Please checkout [pot-logger](https://github.com/cantonjs/pot-logger) for detail.


#### createLogger(category[, appenderDescription])

```js
import { createLogger } from 'claypot';
```

Create a custom logger. Please checkout [pot-logger](https://github.com/cantonjs/pot-logger) for detail.


#### getLogger(category)

```js
import { getLogger } from 'claypot';
```

Get logger by category. If not found, it would return the default logger. Please checkout [pot-logger](https://github.com/cantonjs/pot-logger) for detail.


#### setLoggers(keyStringOrConfigObject[, value])

```js
import { setLoggers } from 'claypot';
```

Set loggers. Please checkout [pot-logger](https://github.com/cantonjs/pot-logger) for detail.


#### overrideConsole([logger])

```js
import { overrideConsole } from 'claypot';
```

Override native console. Notice that console.log() will be equal with logger.info(). Please checkout [pot-logger](https://github.com/cantonjs/pot-logger) for detail.


#### resetConsole()

```js
import { resetConsole } from 'claypot';
```

Reset console to the native one. Only work after overrideConsole() run. Please checkout [pot-logger](https://github.com/cantonjs/pot-logger) for detail.


#### overrideConsoleInRuntime(startRun[, logger])

```js
import { overrideConsoleInRuntime } from 'claypot';
```

Override native console in startRun function runtime. Please checkout [pot-logger](https://github.com/cantonjs/pot-logger) for detail.


#### start([opitons])

```js
import { start } from 'claypot';
```

Starting a Claypot server.

###### Arguments

- `options` (Object): Please checkout [congiguration](/api/configuration.md)


#### stop([options])

```js
import { stop } from 'claypot';
```

Stopping a Claypot server.

###### Arguments

- `options` (Object):
    + `name` (String): Defining which server you want to stop.
    + `force` (Boolean): Force stopping without confirmation.

