"use strict";

var logger = require('../logger');
var question = require('readline-sync').question;
var tokenStorage = require('../api/token-storage');

var innerActions = {
    'init': require('./action/action-init'),
    'deploy': require('./action/action-deploy'),
    'delete': require('./action/action-delete'),
    'run': require('./action/action-run')
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

    if (!innerActions[command]) {
      logger.error("Could not find action command " + command);
      process.exit(1);
    }

    switch(command) {
      case 'init':
        if(!options.object && !options.action){
          logger.log('You\'ll need a controlling object, and an action name to create a new action. You can supply these as parameters to the call:')
            .log('backand action init --object items --action action1\n'.blue)
            .log('Or you can complete the wizard below:\n');

        }
        break;
      case 'deploy':
        if(!options.object && !options.action){
          logger.log('You\'ll need a controlling object, and an action name to deploy an action. You can supply these as parameters to the call:')
              .log('backand action deploy --object items --action action1\n'.blue)
              .log('Or you can complete the wizard below:\n');
        }
        break;
      case 'delete':
        if(!options.object && !options.action){
          logger.log('You\'ll need a controlling object, and an action name to delete an action. You can supply these' +
              ' as parameters to the call:')
              .log('backand action delete --object items --action action1\n'.blue)
              .log('Or you can complete the wizard below:\n');
        }
        break;
      case 'run':
        if(!options.object && !options.action){          
          logger.log('You\'ll need a controlling object, and an action name to run an action. You can supply these' +
              ' as parameters to the call:')
              .log('backand action run --object items --action action1\n'.blue)
              .log('Or you can complete the wizard below:\n');
        }
      break;
    }

    var appName = options.app;//Get latest app name, don't get it from user any more || question('App Name: '.grey);
    if(!appName){
      appName = tokenStorage.getCurrentApp();
    }
    var object = options.object || question('Object Name: '.grey);
    var actionName = options.action || question('Action Name: '.grey);

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


    if (!object || !actionName) {
        logger.error('Must input object name and action name');
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

    if(command === 'run'){
      innerActions[command](appName, object, actionName, options, userToken, masterToken, token);
    } 
    else {
      innerActions[command](appName, object, actionName, userToken, masterToken, token, folder, templateName);
    }
};

