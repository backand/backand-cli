"use strict";

var logger = require('../logger');
var data = require('../api/data');
var question = require('readline-sync').question;

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
    var masterToken = options.master || question('Master Token: '.grey);
    var userToken = options.user || question('User Token: '.grey);
    var folder = options.folder;

    if (!appName || !object || !actionName) {
        logger.error('Must input app name, object name and action name');
        process.exit(1);
    }

    if (!masterToken || !userToken) {
        logger.error('Must provide master token and user token');
        process.exit(1);
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

    innerActions[command](appName, object, actionName, userToken, masterToken, folder);

};

