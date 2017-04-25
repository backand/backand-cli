"use strict";
var question = require('readline-sync').question;

var logger        = require('../logger');
var data          = require('../api/general');
var tokenStorage  = require('../api/token-storage');


module.exports = function (options) {

  var appName = options.app;//Get latest app name, don't get it from user any more || question('App Name: '.grey);
  if(!appName){
    appName = tokenStorage.getCurrentApp();
  }
	var object = options.object || question('Object: '.grey);

  var params = options.params;
  // if(!options.object){ //only ask if the object was not provided
  //   params = question('Parameters (optional): '.grey);
  // }
  //
  // params = {}; //'parameters={' + params + '}';

	if (!object) {
	  	logger.warn('Must input object name');
	  	return
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

	data.get(appName, object, params, null, token, options.master + ':' + options.user).then(function(data){
    process.exit(0);
  }, function(err){
    process.exit(1);
  })
};