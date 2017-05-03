"use strict";

var question = require('readline-sync').question;
var util = require('util');

var config  = require('../../config');
var data    = require('../../api/general');
var logger = require('../../logger');

module.exports = function (appName, object, action, options, userToken, masterToken, token) {

  var paramsValue = {};
  var parameters = options.params || question('Parameters (JSON): '.grey);
  if(parameters){
      try{
      paramsValue = JSON.parse(parameters);
    }
    catch(e){
      logger.warn('Parameters should be a valid JSON');
      process.exit(1);
    } 
  }

  var debug = options.debug || question('Debug (false): '.grey);

  if(debug){
    paramsValue.$$debug$$ = true;
  }


  var params = {"parameters":JSON.stringify(paramsValue)};

  data.runAction(appName, object, action, params, null, token, options.master + ':' + options.user).then(function(data){
    process.exit(0);
  }, function(err){
    logger.error('error: %j', err);
    process.exit(1);
  });


};