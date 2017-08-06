# Getting Started

## Starting a server

After installed claypot, starting a claypot server could not be easier by running:

```bash
claypot start
```

After run `claypot start` command, Claypot will start a server that serves directory `./static/` by default.

Most projects will need a more complex setup, which is why Claypot supports a configuration file. This is much more efficient than having to type in a lot of commands in the terminal.

If a `Claypotfile.js` is present, the `claypot start` command picks it up by default. For more usage, please checkout [configuration](/api/configuration.md).

## Claypotfile

A `Claypotfile.js` file must export a `JSON` object. Here's an example:

```javascript
module.exports = {
    name: 'MyApp',
    port: 8080,
};
```


