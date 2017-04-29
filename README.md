# Backand CLI

A CLI Tool for [Backand](https://www.backand.com).

## Install

```sh
$ npm install -g backand
```

## Usage

**Notice:** Run ```backand help``` to see available commands

Pick the appropriate section below for the command you need.

Note that you should use these commands from a folder in which your user has write access. The SDK creates some maintenance and intermediary files and folders as it works, which can be problematic if the user does not have sufficient permission.

### Register / Login to Backand

To create an account with Backand, run the following command:

```sh
$ backand signup
```

You will be prompted for your new account details, but you can also provide them as arguments to the signup call. You can pull the list from the tool's "help" function.

Once you have a user, you can sign in using:

```sh
$ backand signin
```
You will be prompted for your account email, password, and app name to authenticate with.

After successful login, your access token will be stored in a file locally, and you'll be able to make use of the more powerful CLI commands.

### Managing Actions and Functions

You can use the CLI to manage all of the Server-Side Node.JS functions and actions in your application. To manage actions, use the following set of commands:

#### Action commands
* Creates a new action
```sh
$ backand action init
```

* Debugs an action locally (from within the action folder)
```sh
$ npm debug.js
```
* Deploys an action
```sh
$ backand action deploy
```

#### Function commands
* Creates a new function
```sh
$ backand function create
```

* Deploys a function
```sh
$ backand function deploy
```

* Deletes a function
```sh
$ backand function delete
```

* Runs a function
```sh
$ backand function run
```

### Using Backand CLI Commands in Shell Script

All commands can be run non-interactively in a shell script by supplying their parameters on the command line. Here is an example script that fetches a list of objects, creates an action, creates a function, then syncs with the server:

```sh
$ backand get --master <masterapptoken> --user <userapptoken> --app <appName> --object <objectName>
$ backand action init --object <object> --action <actionname>    
$ backand function init --name <functionName>
$ backand sync
```

### Deploying an AngularJS 2 Project with the CLI

In order to use Backand hosting, you need to set the base href of the project when building your app. Do this as follows: 

    ng build --base-href /appName/

Simply replace "appName" with the name of your app in Backand, and you are ready to go!

### Updating backand

Checking for updates on each command slows down cli apps a lot. Hence, backand won't check for updates automatically.
You can easily install updates at your leisure using NPM:

```sh
$ npm update -g backand
```

You can also simply re-install the tool:

```sh
$ npm install -g backand
```

## Testing

To run the CLI's suite of unit tests, clone the repo and run the following commands:

```sh
$ cd backand-cli
$ npm install
$ npm test
```

## Learn More

You can find more info on the Backand CLI in [our documentation](http://docs.backand.com/#backand-cli)
## License

MIT Licensed

Copyright (c) 2015, [Backand](https://www.backand.com)

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
