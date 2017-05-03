"use strict";

var logger = require('../logger');
var question = require('readline-sync').question;
var tokenStorage = require('../api/token-storage');

var innerFunctions = {
    'init': require('./function/function-init'),
    'deploy': require('./function/function-deploy'),
    'delete': require('./function/function-delete'),
    'run': require('./function/function-run')
};

/*
 { _: [ 'action', 'init' ],
 app: 'myApp',
 object: 'items',
 action: 'myAction' }
 */
module.exports = function (options) {

  // see json upper -> it should be second command -> init, deploy
  var command = options._[1];

  if (!innerFunctions[command]) {
    logger.error("Could not find function command " + command);
    process.exit(1);
  }

  switch(command) {
    case 'init':
      if(!options.name){
        logger.log('You\'ll need a function name to create a new function. You can supply this as parameter to the' +
            ' call:')
            .log('backand function init --name function1\n'.blue)
            .log('Or you can complete the wizard below:\n');

      }
      break;
    case 'deploy':
      if(!options.name){
        logger.log('You\'ll need a function name to deploy a function. You can supply this as parameter to the call:')
            .log('backand function deploy --name function1\n'.blue)
            .log('Or you can complete the wizard below:\n');
      }
      break;
    case 'delete':
      if(!options.name){
        logger.log('You\'ll need a function name to delete a function. You can supply this' +
            ' as parameter to the call:')
            .log('backand function delete --name function1\n'.blue)
            .log('Or you can complete the wizard below:\n');
      }
      break;
      case 'run':
      if(!options.name){
        logger.log('You\'ll need a function name to run a function. You can supply this' +
            ' as parameter to the call:')
            .log('backand function delete --name function1\n'.blue)
            .log('Or you can complete the wizard below:\n');
      }
      break;
  }

  var appName = options.app;//Get latest app name, don't get it from user any more || question('App Name: '.grey);
  if(!appName){
    appName = tokenStorage.getCurrentApp();
  }
  var token = null;
  if (!options.master || !options.user){
    try {
      token = tokenStorage.get(appName);
    }
    catch(err){
      logger.warn('Must login first');
      process.exit(1);
    }
  }

  var functionName = options.name || question('Function Name: '.grey);
  if (!functionName) {
    logger.error('Must input function name');
    process.exit(1);
  }

  var templateName = '';
  if(command === 'init'){
    templateName = options.template;// || question('Template Name: '.grey);
    if (templateName === undefined || templateName === ''){
      templateName = 'template';
    }
  }

  var masterToken = options.master;
  var userToken = options.user;
  var folder = options.folder;

  if(command === 'run'){
    innerFunctions[command](appName, functionName, options, userToken, masterToken, token);
  } 
  else {
    innerFunctions[command](appName, functionName, userToken, masterToken, token, folder, templateName);
  }

};

