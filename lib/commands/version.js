"use strict";

var fs          = require('fs-extra');
var spawn       = require('child_process').spawn;
var http        = require('http');
var logger      = require('../logger');
var ROOT        = __dirname + '/../..';
var prompt      = require('readline-sync').question;
var backandVersion = fs.readJSONSync(ROOT + '/package.json')['version'];

module.exports = function () {
  console.log('Checking for updates...'.grey);
  http.get('http://registry.npmjs.org/backand/latest', function (response) {
    var body = '';
    response.on('data', function(data) { body += data; });
    response.on('end', function() {
      var newVersion = JSON.parse(body).version;
      if (backandVersion === newVersion) {
        console.log('You already have the latest version '.grey + ('(' + backandVersion + ')').blue);
      } else {
        console.log('');
        console.log('  * New version of backand is available: '.yellow + newVersion.green);
        console.log('    (You have '.dim + backandVersion.dim + ')'.dim);

        console.log('    Do you want to update backand?'.grey);
        var answer = prompt('    Yes'.green + ' or ' + 'No: '.red);

        switch (answer.toLowerCase()) {
          case 'yes':
          case 'y':
            console.log('');
            updateBackand();
            break;
          default:
            console.log('');
            console.log('    OK. You can run '.yellow + 'npm update -g backand'.blue + ' to update by yourself'.yellow);
            console.log('');
            return;
        }
      }
    })
  });

  function updateBackand () {
    console.log('Updating backand...'.grey);
    var process = spawn('npm', ['update', '-g', 'backand']);

    process.on('exit', function () {
      backandVersion = fs.readJSONSync(ROOT + '/package.json')['version'];
      console.log('Your backand version is now: '.green + backandVersion.blue);
      logger.done();
    });
  }
};