"use strict";
var question = require('readline-sync').question;

var logger        = require('../logger');
var tokenStorage  = require('../api/token-storage');

var innerActions = {
    'getOne': require('./object/get-one'),
    'getList': require('./object/get-list'),
    'create' : require('./object/create'),
    'update': require('./object/update'),
    'remove': require('./object/remove'),
};


module.exports = function (options) {


  var command = options._[1];

  if (!innerActions[command]) {
    logger.error("Could not find object command " + command);
    process.exit(1);
  }

  var appName = options.app;//Get latest app name, don't get it from user any more || question('App Name: '.grey);
  if(!appName){
    appName = tokenStorage.getCurrentApp();
  }
	var object = options.object || question('Object: '.grey);

  if (!object) {
      logger.warn('Must input object name');
      process.exit(1);
  }

  var masterToken = options.master;
  var userToken = options.user;
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

  var params = options.params;
  if(!options.params){ //only ask if the object was not provided
    params = question('Parameters (optional): '.grey);
  }

  try{
    params = JSON.parse(params);
  }
  catch(e){
    logger.warn('Parameters should be a valid JSON');
    process.exit(1);
  }

  var data = options.data || '{}';
  try{
    data = JSON.parse(data);
  }
  catch(e){
    logger.warn('Data should be a valid JSON');
    process.exit(1);
  }
  
              
  innerActions[command](appName, object, params, data, null, token, options.master + ':' + options.user);


};