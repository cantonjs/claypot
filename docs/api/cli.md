# Command Line Interface (CLI)

Claypot provides a Command Line Interface (CLI) to configure and interact with your servers or processes.

Before using CLI, make sure you have [installed Claypot globally](/README.md#globally).

You can run `claypot -h` for help in terminal.


## Commands

### Start

Starting a Claypot server.

###### Usage

    claypot start [options]

###### Options

Please checkout [Configuration](/configuration.md#properties)


### Stop

Stopping a Claypot server by name.

###### Usage

    claypot stop [name] [options]

If `name` is not provided, Claypot will ask you to select which one you want to stop.

###### Options

- `--force` (Boolean): Force stopping without confirmation. (Alias: `-f`)


### List

List running Claypot servers.

###### Usage

    claypot list

*Alias: `ls`*

### Log

Displaying the last part of a Claypot server log file.

###### Usage

    claypot log [name] [options]

If `name` is not provided, Claypot will ask you to select which server you want to display.

###### Options

- `--category` (String): The category of log files. (Alias: `-c`)
- `--line` (Number): The max lines of log messages. Defaults to `200`. (Alias: `-l`)
- `--follow` (Boolean): Enable follow mode. Just like `tail -f`. (Alias: `-l`)


### Directory

Displaying the directory of a Claypot server project.

###### Usage

    claypot directory [name]

If `name` is not provided, Claypot will ask you to select which server you want to display.
