"use strict";

var logger = require('../logger');
var data = require('../api/data');
var question = require('readline-sync').question;
var tokenStorage = require('../api/token_storage');

var innerActions = {
    'init': require('./action/action-init'),
    'deploy': require('./action/action-deploy')
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
    var object = options.object || question('Object Name: '.grey);
    var actionName = options.action || question('Action Name: '.grey);
    var masterToken = options.master;
    var userToken = options.user;
    var folder = options.folder;

    if (!appName || !object || !actionName) {
        logger.error('Must input app name, object name and action name');
        process.exit(1);
    }

    if (!options.master || !options.user){
        try {
            var token = tokenStorage.get(appName);  
        }
        catch(err){
            logger.warn('Must login first');
            process.exit(1);
        }
    }


    if (!innerActions[command]) {
        logger.error('can\'t find command ' + command);
        process.exit(1);
    }

    if (!innerActions[command]) {
        logger.error("Could not find action command " + command);
        process.exit(1);
    }

    if (command == 'deploy' && !folder){
         var folder = question('Source Folder: '.grey);
         if (!folder){
            logger.error("Must provide source folder ");
            process.exit(1); 
         }
    }

    innerActions[command](appName, object, actionName, userToken, masterToken, token, folder);

};

