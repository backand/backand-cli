"use strict";

var logger = require('../logger');
var question = require('readline-sync').question;
var tokenStorage = require('../api/token-storage');

var innerFunctions = {
    'init': require('./function/function-init'),
    'deploy': require('./function/function-deploy'),
    'delete': require('./function/function-delete')
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

    var appName = options.app || question('App Name: '.grey);
    var functionName = options.name || question('Function Name: '.grey);

    var templateName = '';
    if(command === 'init'){
      templateName = options.template || question('Template Name: '.grey);
      if (templateName === ''){
        templateName = 'template';
      }
    }

    var masterToken = options.master;
    var userToken = options.user;
    var folder = options.folder;

    if (!appName || !functionName) {
        logger.error('Must input app name and function name');
        process.exit(1);
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

    if (!innerFunctions[command]) {
        logger.error("Could not find function command " + command);
        process.exit(1);
    }

  innerFunctions[command](appName, functionName, userToken, masterToken, token, folder, templateName);

};

