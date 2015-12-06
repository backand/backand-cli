# Backand CLI

CLI Tools for [Backand Cloud Services](http://backand.com).

## Install

```sh
$ npm install -g backand
```

## Usage

**Notice:** Run ```backand help``` to see available commands

### Register / Login to Backand

If you don't already have an account in Backand, run the following command:

```sh
$ backand register
```

You will be prompted for your details.

After that, or if you already have a user, you can sign in using:

```sh
$ backand login
```
You will be prompted for email, password, and app name.

After successful login, your access token will be stored in a file and you can access Backand using powerful CLI commands.

### Running REST commands

You can perform all REST API commands using the CLI.
You will be prompted for the required arguments for the command.

The output shows you the details of the request and the response.
This is very helpful for developing a client that connects to Backand.

1. Retrieve data from a specific object:
```sh
$ backand get 
```

You will be prompted for the app name and object name

2. Create a model from a JSON description of the model
```sh
$ backand create
```

You will be prompted for the app name and model. The model should be enclosed in quotes.

3. Sync local project folder to Backand
```sh
$ backand sync 
```

You will be prompted for the path to the prohect folder


4. Clean syncing cache 
```sh
$ backand clean
```

### Using Backand CLI Commands in Shell Script

All commands can be run non-interactively in a shell script by supplying their parameters on the command line.

1. backand get --master <masterapptoken> --user <userapptoken> --app <appName> --object <objectName>
2. backand create --master <masterapptoken> --user <userapptoken>  --app <appName> --object <objectjson>
3. backand sync --master <masterapptoken> --user <userapptoken> --folder /path/to/project/folder
4. backand clean 

### Updating backand

Checking for updates on each command slows down cli apps a lot. Hence, backand won't check for updates automatically.
You can check for a new version by running:

```sh
$ backand update
```

If a new version is available, you will asked if you want to update.

## License

MIT Licensed

Copyright (c) 2015, [Backand](http://backand.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
